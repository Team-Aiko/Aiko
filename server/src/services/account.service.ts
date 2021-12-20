/* eslint-disable no-unused-vars */

// * Database
import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { ResultSetHeader } from 'mysql2';
import { User } from '../entity';
// * mailer
import * as nodemailer from 'nodemailer';
import { SendMailOptions } from 'nodemailer';
import * as smtpPool from 'nodemailer-smtp-pool';
// * UUID generator
import { v1 } from 'uuid';
// * config reader
import * as config from 'config';
// * jwt
import * as jwt from 'jsonwebtoken';
import { accessTokenBluePrint, refreshTokenBluePrint } from '../interfaces/jwt/secretKey';
// * others

import { IMailConfig, IMailBotConfig, UserTable } from '../interfaces';
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
import { checkPw, generatePwAndSalt, getRepo, propsRemover } from 'src/Helpers/functions';
import { AikoError } from 'src/Helpers/classes';
import { IFileBundle } from 'src/interfaces/MVC/fileMVC';
import UserProfileFileRepository from 'src/mapper/userProfileFile.repository';
import PrivateChatService from './privateChat.service';
import StatusService from './status.service';
import DriveService from './drive.service';

// * mailer
const emailConfig = config.get<IMailConfig>('MAIL_CONFIG');
const botEmailAddress = config.get<IMailBotConfig>('MAIL_BOT').botEmailAddress;
const smtpTransporter = nodemailer.createTransport(smtpPool(emailConfig));

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
            throw err;
        }
    }

    async getCountryList(str: string) {
        try {
            return await getRepo(CountryRepository).getCountryList(str);
        } catch (err) {
            throw err;
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
            throw new AikoError('hasher error', 501, 500021);
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
                await this.driveService.createFolder(data.companyPK, 'root', undefined, queryRunner.manager);
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
            this.statusService.generateUserStatus(userPK, data.companyPK);

            // * email auth
            const uuid = v1();
            await getRepo(RefreshRepository).createRow(queryRunner.manager, userPK);
            flag = await getRepo(LoginAuthRepository).createNewRow(queryRunner.manager, uuid, userPK);

            if (flag) {
                const mailOpt: SendMailOptions = {
                    from: botEmailAddress,
                    to: data.email,
                    subject: '[Aiko] Auth Email',
                    text: `Please link to this address: http://localhost:5000/account/login-auth?id=${uuid}`,
                };

                flag = await new Promise<boolean>((resolve, reject) => {
                    smtpTransporter.sendMail(mailOpt, async (err, response) => {
                        if (err) resolve(false);
                        else resolve(true);
                    });
                });

                if (!flag) throw new AikoError('account/signup/mailing error', 500, 3901892);
            }

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            await this.statusService.deleteUserStatus(userPK);
            throw err;
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

            if (!flag) throw new AikoError('unknown fail error', 500, 500026);

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }

        return flag;
    }

    async login(data: Pick<UserTable, 'NICKNAME' | 'PASSWORD'>): Promise<BasePacket | SuccessPacket> {
        try {
            let result = await getRepo(UserRepository).getUserInfoWithNickname(data.NICKNAME, false, false);
            const flag = await checkPw(data.PASSWORD, result.SALT, result.PASSWORD);
            let bundle: BasePacket | SuccessPacket;

            if (!flag) {
                bundle = {
                    header: false,
                };
            }

            // get grant list
            const grantList = await getRepo(GrantRepository).getGrantList(result.USER_PK);
            result.grants = grantList;
            // remove security informations
            result = propsRemover(result, 'PASSWORD', 'SALT');
            console.log('🚀 ~ file: account.service.ts ~ line 234 ~ AccountService ~ hasher ~ result', result);
            // make token
            const token = this.generateLoginToken(result);
            // refresh token update to database
            await getRepo(RefreshRepository).updateRefreshToken(result.USER_PK, token.refresh);

            bundle = {
                header: flag,
                userInfo: result,
                accessToken: token.access,
                refreshToken: token.refresh,
            };

            return bundle;
        } catch (err) {
            throw err;
        }
    }

    async findNickname(email: string): Promise<boolean> {
        let flag = false;

        try {
            const result = await getRepo(UserRepository).findNickname(email);

            const { NICKNAME } = result;
            const mailOpt = {
                from: botEmailAddress,
                to: email,
                subject: '[Aiko] We will show you your nickname!',
                text: `Your Nickname: ${NICKNAME}`,
            };

            flag = await new Promise<boolean>((resolve, reject) => {
                smtpTransporter.sendMail(mailOpt, (err, response) => {
                    if (err) {
                        resolve(false);
                        throw err;
                    }

                    console.log('Message send: ', response);
                    resolve(true);
                });
            });

            flag = true;
        } catch (err) {
            throw err;
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

            const mailOpt: SendMailOptions = {
                from: botEmailAddress,
                to: email,
                subject: '[Aiko] We got a request of reset password.',
                text: `
                    IF YOU DO NOT REQUEST THIS, JUST IGNORE.

                    Please link to this address: http://localhost:3000/reset-password/${uuid}`,
            };

            returnVal = await new Promise<boolean>((resolve, reject) => {
                smtpTransporter.sendMail(mailOpt, (err, response) => {
                    if (err) {
                        resolve(false);
                        throw err;
                    }
                    resolve(true);
                });
            });
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw new AikoError('testError', 451, 500000);
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
            const { USER_PK } = result1[0];

            const { hash, salt } = await generatePwAndSalt(password);

            returnVal = await getRepo(UserRepository).changePassword(USER_PK, hash, salt);
            if (returnVal) returnVal = await getRepo(ResetPwRepository).removeRequests(USER_PK);

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw new AikoError('testError', 451, 500000);
        } finally {
            await queryRunner.release();
        }

        return returnVal;
    }

    async checkDuplicateNickname(nickname: string): Promise<number> {
        try {
            return await getRepo(UserRepository).checkDuplicateNickname(nickname);
        } catch (err) {
            throw new AikoError('testError', 451, 500000);
        }
    }

    async getGrantList(userPK: number) {
        try {
            return await getRepo(GrantRepository).getGrantList(userPK);
        } catch (err) {
            throw new AikoError('testError', 451, 500000);
        }
    }

    generateLoginToken(userInfo: User) {
        let temporaryUserInfo = propsRemover(
            userInfo,
            'SALT',
            'PASSWORD',
            'LAST_NAME',
            'FIRST_NAME',
            'EMAIL',
            'TEL',
            'IS_DELETED',
            'IS_VERIFIED',
            'COUNTRY_PK',
            'PROFILE_FILE_NAME',
            'company',
            'department',
            'country',
            'resetPws',
            'socket',
            'socket1',
            'socket2',
            'calledMembers',
            'profile',
        );
        temporaryUserInfo = { ...temporaryUserInfo };
        const userPk = temporaryUserInfo.USER_PK;
        const tokens = {
            access: jwt.sign(temporaryUserInfo, accessTokenBluePrint.secretKey, accessTokenBluePrint.options),
            refresh: jwt.sign({ userPk: userPk }, refreshTokenBluePrint.secretKey, refreshTokenBluePrint.options),
        };
        return tokens;
    }

    // 어세스 토큰 재 발급 (확인필요)
    async getAccessToken(refreshToken: string) {
        try {
            const payload = jwt.verify(refreshToken, refreshTokenBluePrint.secretKey) as jwt.JwtPayload;
            const dbToken = await getRepo(RefreshRepository).checkRefreshToken(payload.userPk);
            const userData = await this.getUserInfo(payload.userPk);

            if (dbToken === refreshToken && !('userEntity' in userData)) {
                const tokens = this.generateLoginToken(userData);
                await getRepo(RefreshRepository).updateRefreshToken(payload.userPk, tokens.refresh);
                return { header: true, accessToken: tokens.access, refreshToken: tokens.refresh } as ITokenBundle;
            } else throw new AikoError('not exact refresh token', 500, 392038);
        } catch (error) {
            const err = error as jwt.VerifyErrors;
            if (err.name === 'TokenExpiredError') throw new AikoError(err.name, 500, 500001);
            else if (err.name === 'JsonWebTokenError') throw new AikoError(err.name, 500, 500002);
            else throw error;
        }
    }

    async getUserInfo(nickname: string, companyPK?: number) {
        try {
            return await getRepo(UserRepository).getUserInfoWithNickname(nickname, true, true, companyPK);
        } catch (err) {
            throw err;
        }
    }
}
