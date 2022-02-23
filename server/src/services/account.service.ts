/* eslint-disable no-unused-vars */

// * Database
import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { ResultSetHeader } from 'mysql2';

// * UUID generator
import { v1 } from 'uuid';

// * others
import { UserTable } from '../interfaces';
import { ISignup, BasePacket, SuccessPacket, ITokenBundle } from '../interfaces/MVC/accountMVC';
import {
    RefreshRepository,
    UserRepository,
    CountryRepository,
    ResetPwRepository,
    LoginAuthRepository,
    CompanyRepository,
    GrantRepository,
} from '../mapper';
import {
    checkPw,
    checkRefreshToken,
    generateLoginToken,
    generatePwAndSalt,
    getRepo,
    propsRemover,
    sendMail,
    stackAikoError,
} from 'src/Helpers/functions';
import { AikoError } from 'src/Helpers/classes';
import { IFileBundle } from 'src/interfaces/MVC/fileMVC';
import UserProfileFileRepository from 'src/mapper/userProfileFile.repository';
import PrivateChatService from './privateChat.service';
import StatusService from './status.service';
import DriveService from './drive.service';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { unknownError } from 'src/Helpers';
import winstonLogger from 'src/logger/logger';

enum accountServiceError {
    checkDuplicateEmail = 1,
    getCountryList = 2,
    signup = 3,
    grantLoginAuth = 4,
    login = 5,
    findNickname = 6,
    requestResetPassword = 7,
    resetPassword = 8,
    checkDuplicateNickname = 9,
    getGrantList = 10,
    getAccessToken = 11,
    getUserInfo = 12,
}

@Injectable()
export default class AccountService {
    constructor(
        private privateChatService: PrivateChatService,
        private statusService: StatusService,
        private driveService: DriveService,
    ) {}

    async checkDuplicateEmail(email: string): Promise<number> {
        try {
            return await getRepo(UserRepository).checkDuplicateEmail(email);
        } catch (err) {
            throw stackAikoError(
                err,
                'AccountService/checkDuplicateEmail',
                500,
                headErrorCode.account + accountServiceError.checkDuplicateEmail,
            );
        }
    }

    async getCountryList(str: string) {
        try {
            return await getRepo(CountryRepository).getCountryList(str);
        } catch (err) {
            throw stackAikoError(
                err,
                'AccountService/getCountryList',
                500,
                headErrorCode.account + accountServiceError.getCountryList,
            );
        }
    }

    async signup(data: ISignup, fileBundle: IFileBundle) {
        let hash: string;
        let salt: string;

        try {
            const generatePwResult = await generatePwAndSalt(data.pw);
            hash = generatePwResult.hash;
            salt = generatePwResult.salt;
        } catch (err) {
            throw new AikoError('AccountService/signup/hasherError', 500, -1);
        }

        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        let flag = false;
        let userPK: number;

        try {
            // 이미지 테이블 로우 생성쿼리
            let profilePK: number;
            if (fileBundle && fileBundle.FILE_NAME && fileBundle.ORIGINAL_NAME) {
                profilePK = await getRepo(UserProfileFileRepository).insertProfileImage(
                    fileBundle,
                    queryRunner.manager,
                );
            }

            if (data.position === 0) {
                // 회사 생성쿼리
                const result1 = await getRepo(CompanyRepository).createCompany(queryRunner.manager, data.companyName);
                console.log('step1');
                const rawData1: ResultSetHeader = result1.raw;
                const COMPANY_PK = rawData1.insertId as number;
                console.log('step2');
                data.companyPK = COMPANY_PK;

                // admin 생성쿼리
                const result3 = await getRepo(UserRepository).createUser(
                    queryRunner.manager,
                    data,
                    profilePK,
                    hash,
                    salt,
                );
                console.log('step3');
                userPK = (result3.raw as ResultSetHeader).insertId as number;
                // admin 권한부여 쿼리
                await getRepo(GrantRepository).grantPermission(1, userPK, queryRunner.manager);
                console.log('step4');

                // * generate drive root folder
                await this.driveService.createRootFolder(data.companyPK, queryRunner.manager);
            } else if (data.position === 1) {
                // 사원 생성 쿼리
                const result = await getRepo(UserRepository).createUser(
                    queryRunner.manager,
                    data,
                    profilePK,
                    hash,
                    salt,
                );
                userPK = (result.raw as ResultSetHeader).insertId as number;
                await this.privateChatService.makePrivateChatRoomList(queryRunner.manager, data.companyPK, userPK);
            }

            // * generate status database (mongodb)
            await this.statusService.generateUserStatus(userPK, data.companyPK);

            // * email auth
            const uuid = v1();
            await getRepo(RefreshRepository).createRow(queryRunner.manager, userPK);
            flag = await getRepo(LoginAuthRepository).createNewRow(queryRunner.manager, uuid, userPK);

            if (flag) {
                const mailOpt = {
                    to: data.email,
                    subject: '[Aiko] Auth Email',
                    text: `Please link to this address: http://localhost:5000/account/login-auth?id=${uuid}`,
                };

                flag = await sendMail(mailOpt);

                if (!flag) throw new AikoError('AccountService/signup/mailing error', 500, -1);
            }

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            await this.statusService.deleteUserStatus(userPK);
            throw stackAikoError(err, 'AccountService/signup', 500, headErrorCode.account + accountServiceError.signup);
        } finally {
            await queryRunner.release();
        }

        return flag;
    }

    async grantLoginAuth(uuid: string): Promise<boolean> {
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.startTransaction();
        let flag = false;

        try {
            const result = await getRepo(LoginAuthRepository).findUser(uuid);
            flag = await getRepo(UserRepository).giveAuth(result.USER_PK);

            if (!flag) throw unknownError;

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw stackAikoError(
                err,
                'AccountService/grantLoginAuth',
                500,
                headErrorCode.account + accountServiceError.grantLoginAuth,
            );
        } finally {
            await queryRunner.release();
        }

        return flag;
    }

    async login(data: Pick<UserTable, 'NICKNAME' | 'PASSWORD'>): Promise<SuccessPacket> {
        winstonLogger.debug('login method executed');
        try {
            let result = await getRepo(UserRepository).getUserInfoWithNickname(data.NICKNAME, false, false);
            const flag = await checkPw(data.PASSWORD, result.SALT, result.PASSWORD);

            if (!flag) throw new AikoError('accountService/NO_MEMBER_ERROR_OR_INVALID_PASSWORD', 500, -1);

            // get grant list
            const grantList = await getRepo(GrantRepository).getGrantList(result.USER_PK);
            result.grants = grantList;
            // remove security informations
            result = propsRemover(result, 'PASSWORD', 'SALT');
            console.log('🚀 ~ file: account.service.ts ~ line 234 ~ AccountService ~ hasher ~ result', result);
            // make token
            const token = generateLoginToken(result);
            // refresh token update to database
            await getRepo(RefreshRepository).updateRefreshToken(result.USER_PK, token.refresh);

            const bundle: SuccessPacket = {
                header: flag,
                userInfo: result,
                accessToken: token.access,
                refreshToken: token.refresh,
            };

            return bundle;
        } catch (err) {
            throw stackAikoError(err, 'AccountService/login', 500, headErrorCode.account + accountServiceError.login);
        }
    }

    async findNickname(email: string): Promise<boolean> {
        let flag = false;

        try {
            const result = await getRepo(UserRepository).findNickname(email);

            const { NICKNAME } = result;
            const mailOpt = {
                to: email,
                subject: '[Aiko] We will show you your nickname!',
                text: `Your Nickname: ${NICKNAME}`,
            };

            flag = await sendMail(mailOpt);
        } catch (err) {
            throw stackAikoError(
                err,
                'AccountService/findNickname',
                500,
                headErrorCode.account + accountServiceError.findNickname,
            );
        }

        return flag;
    }

    async requestResetPassword(email: string): Promise<boolean> {
        const queryRunner = getConnection().createQueryRunner();
        let returnVal = false;

        try {
            await queryRunner.startTransaction();

            const result1 = await getRepo(UserRepository).getUserInfoWithEmail(email);
            const { USER_PK } = result1;

            const uuid = v1();
            const result2 = await getRepo(ResetPwRepository).getRequestCount(USER_PK);
            if (result2 > 5) throw new Error('request Exceed');

            const result3 = await getRepo(ResetPwRepository).insertRequestLog(USER_PK, uuid);
            if (!result3) throw new Error('database insert error');

            const mailOpt = {
                to: email,
                subject: '[Aiko] We got a request of reset password.',
                text: `
                    IF YOU DO NOT REQUEST THIS, JUST IGNORE.

                    Please link to this address: http://localhost:3000/reset-password/${uuid}`,
            };

            returnVal = await sendMail(mailOpt);
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw stackAikoError(
                err,
                'AccountService/requestResetPassword',
                500,
                headErrorCode.account + accountServiceError.requestResetPassword,
            );
        } finally {
            await queryRunner.release();
        }

        return returnVal;
    }

    async resetPassword(uuid: string, password: string) {
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.startTransaction();
        let returnVal = false;

        try {
            const result1 = await getRepo(ResetPwRepository).getRequest(uuid);
            const { USER_PK } = result1;

            const { hash, salt } = await generatePwAndSalt(password);

            returnVal = await getRepo(UserRepository).changePassword(USER_PK, hash, salt);
            if (returnVal) returnVal = await getRepo(ResetPwRepository).removeRequests(USER_PK);

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw stackAikoError(
                err,
                'AccountService/resetPassword',
                500,
                headErrorCode.account + accountServiceError.resetPassword,
            );
        } finally {
            await queryRunner.release();
        }

        return returnVal;
    }

    async checkDuplicateNickname(nickname: string): Promise<number> {
        try {
            return await getRepo(UserRepository).checkDuplicateNickname(nickname);
        } catch (err) {
            throw stackAikoError(
                err,
                'AccountService/checkDuplicateNickname',
                500,
                headErrorCode.account + accountServiceError.checkDuplicateNickname,
            );
        }
    }

    async getGrantList(userPK: number) {
        try {
            return await getRepo(GrantRepository).getGrantList(userPK);
        } catch (err) {
            throw stackAikoError(
                err,
                'AccountService/getGrantList',
                500,
                headErrorCode.account + accountServiceError.getGrantList,
            );
        }
    }

    // 어세스 토큰 재 발급 (확인필요)
    async getAccessToken(refreshToken: string) {
        try {
            const userPK = checkRefreshToken(refreshToken);
            const dbToken = await getRepo(RefreshRepository).checkRefreshToken(userPK);
            const userData = await getRepo(UserRepository).getUserInfoWithUserPK(userPK);

            if (dbToken === refreshToken && !('userEntity' in userData)) {
                const tokens = generateLoginToken(userData);
                await getRepo(RefreshRepository).updateRefreshToken(userPK, tokens.refresh);
                return { header: true, accessToken: tokens.access, refreshToken: tokens.refresh } as ITokenBundle;
            } else throw new AikoError('not exact refresh token', 500, -1);
        } catch (err) {
            if (err.name === 'TokenExpiredError') throw new AikoError(err.name, 500, -1);
            else if (err.name === 'JsonWebTokenError') throw new AikoError(err.name, 500, -1);
            else
                throw stackAikoError(
                    err,
                    'AccountService/getAccessToken',
                    500,
                    headErrorCode.account + accountServiceError.getAccessToken,
                );
        }
    }

    async getUserInfo(nickname: string, companyPK?: number) {
        try {
            return await getRepo(UserRepository).getUserInfoWithNickname(nickname, true, true, companyPK);
        } catch (err) {
            throw stackAikoError(
                err,
                'AccountService/getUserInfo',
                500,
                headErrorCode.account + accountServiceError.getUserInfo,
            );
        }
    }
}
