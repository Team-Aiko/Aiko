/* eslint-disable no-unused-vars */
// * http
import { Response } from 'express';
// * Database
import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { ResultSetHeader } from 'mysql2';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ObjectType } from 'typeorm';
import { User, LoginAuth, Country, ResetPw, Company, Department } from '../entity';
// * mailer
import * as nodemailer from 'nodemailer';
import { SendMailOptions } from 'nodemailer';
import * as smtpPool from 'nodemailer-smtp-pool';
// * UUID generator
import { v1 } from 'uuid';
// * pbdkf2-password
import pbkdf2 from 'pbkdf2-pw';
// * config reader
import * as config from 'config';
// * jwt
import * as jwt from 'jsonwebtoken';
import { expireTime } from '../interfaces/jwt/jwtEnums';
import { loginSecretKey } from '../interfaces/jwt/secretKey';
// * others

import {
    IAccountService,
    ISignup,
    UserTable,
    BasePacket,
    SuccessPacket,
    IMailConfig,
    IMailBotConfig,
} from '../interfaces';
import {
    RefreshRepository,
    UserRepository,
    CountryRepository,
    ResetPwRepository,
    LoginAuthRepository,
    CompanyRepository,
    DepartmentRepository,
    OTOChatRoomRepository,
} from '../mapper';
import { setFlagsFromString } from 'v8';
import { getRepo, propsRemover } from 'src/Helpers/functions';
import SocketService from './socket.service';
import { AikoError } from 'src/Helpers/classes';

// * mailer
const emailConfig = config.get<IMailConfig>('MAIL_CONFIG');
const botEmailAddress = config.get<IMailBotConfig>('MAIL_BOT').botEmailAddress;
const smtpTransporter = nodemailer.createTransport(smtpPool(emailConfig));

// * pbkdf2
const hasher = pbkdf2();

@Injectable()
export default class AccountService {
    constructor(private socketService: SocketService) {}

    async checkDuplicateEmail(email: string): Promise<number> {
        try {
            return await getRepo(UserRepository).checkDuplicateEmail(email);
        } catch (err) {
            throw new AikoError('testError', 451, 500000);
        }
    }

    async getCountryList(str: string) {
        try {
            return await getRepo(CountryRepository).getCountryList(str);
        } catch (err) {
            throw new AikoError('testError', 451, 500000);
        }
    }

    async signup(data: ISignup, imageRoute: string) {
        let hash: string;
        let salt: string;

        try {
            const [a1, a2] = await new Promise<string[]>((resolve, reject) => {
                hasher({ password: data.pw }, (err, pw, salt, hash) => {
                    if (err) throw err;

                    resolve([hash, salt]);
                });
            });

            hash = a1;
            salt = a2;
        } catch (err) {
            throw new AikoError('testError', 451, 500000);
        }
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        let flag = false;

        try {
            let userPK: number;
            if (data.position === 0) {
                const result1 = await getRepo(CompanyRepository).createCompany(queryRunner.manager, data.companyName);
                console.log('step1');
                const rawData1: ResultSetHeader = result1.raw;
                const COMPANY_PK = rawData1.insertId as number;
                const result2 = await getRepo(DepartmentRepository).createOwnerRow(queryRunner.manager, COMPANY_PK);
                console.log('step2');
                const rawData2: ResultSetHeader = result2.raw;
                const DEPARTMENT_PK = rawData2.insertId as number;
                data.companyPK = COMPANY_PK;
                data.departmentPK = DEPARTMENT_PK;

                const result3 = await getRepo(UserRepository).createUser(
                    queryRunner.manager,
                    data,
                    imageRoute,
                    hash,
                    salt,
                );
                console.log('step3');
                userPK = (result3.raw as ResultSetHeader).insertId as number;
                const result4 = await getRepo(RefreshRepository).createRow(userPK);
            } else if (data.position === 1) {
                const result = await getRepo(UserRepository).createUser(
                    queryRunner.manager,
                    data,
                    imageRoute,
                    hash,
                    salt,
                );
                userPK = (result.raw as ResultSetHeader).insertId as number;
            }

            // * email auth
            const uuid = v1();
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
                        if (err) {
                            resolve(false);
                            throw err;
                        }

                        resolve(true);
                    });
                });
            }

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw new AikoError('testError', 451, 500000);
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

            if (!flag) new Error('error give auth method');

            await queryRunner.commitTransaction();
        } catch (err) {
            console.error(err);
            await queryRunner.rollbackTransaction();
            throw new AikoError('testError', 451, 500000);
        } finally {
            await queryRunner.release();
        }

        return flag;
    }

    async login(data: Pick<UserTable, 'NICKNAME' | 'PASSWORD'>): Promise<BasePacket | SuccessPacket> {
        try {
            const result = await getRepo(UserRepository).getUserInfoWithNickname(data.NICKNAME);
            console.log('🚀 ~ file: account.service.ts ~ line 180 ~ AccountService ~ login ~ result', result);
            const packet: BasePacket | SuccessPacket = await new Promise<BasePacket | SuccessPacket>(
                (resolve, reject) => {
                    hasher({ password: data.PASSWORD, salt: result.SALT }, (err, pw, salt, hash) => {
                        const flag = result.PASSWORD === hash;

                        if (!flag) {
                            const bundle: BasePacket = {
                                header: false,
                            };
                            resolve(bundle);
                        }
                        // remove security informations
                        propsRemover(result, 'PASSWORD', 'SALT', 'IS_VERIFIED', 'IS_DELETED');
                        const token = this.generateLoginToken(result);
                        const bundle: SuccessPacket = {
                            header: flag,
                            userInfo: { ...result },
                            accessToken: token.access,
                            refreshToken: token.refresh,
                        };
                        resolve(bundle);
                    });
                },
            );
            return packet;
        } catch (err) {
            throw new AikoError('testError', 451, 500000);
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
            throw new AikoError('testError', 451, 500000);
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

            returnVal = await new Promise<boolean>((resolve, reject) => {
                let flag = false;

                hasher({ password: password }, async (err, pw, salt, hash) => {
                    if (err) throw err;

                    flag = await getRepo(UserRepository).changePassword(USER_PK, hash, salt);
                    if (flag) flag = await getRepo(ResetPwRepository).removeRequests(USER_PK);

                    resolve(flag);
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

    async checkDuplicateNickname(nickname: string): Promise<number> {
        try {
            return await getRepo(UserRepository).checkDuplicateNickname(nickname);
        } catch (err) {
            throw new AikoError('testError', 451, 500000);
        }
    }

    async getUserInfo(userPK: number, companyPK: number) {
        try {
            return await getRepo(UserRepository).getUserInfoWithUserPK(userPK, companyPK);
        } catch (err) {
            throw new AikoError('testError', 451, 500000);
        }
    }

    generateLoginToken(userData: User) {
        const data = { ...userData };
        const userPk = data.USER_PK;
        const tokens = {
            access: jwt.sign(data, loginSecretKey.secretKey, loginSecretKey.options),
            refresh: jwt.sign({ userPk: userPk }, loginSecretKey.secretKey, loginSecretKey.options),
        };
        return tokens;
    }

    // 어세스 토큰 재 발급 (확인필요)

    async accesToken(req) {
        const result = {
            msg: '',
            accessToken: '',
            refreshToken: '',
        };
        try {
            const clientToken = req.cookies.REFRESH_TOKEN;
            const payload = jwt.verify(clientToken, loginSecretKey.secretKey) as jwt.JwtPayload;
            const userPk = payload.userPk;
            const dbToken = await getRepo(RefreshRepository).checkRefreshToken(userPk);
            const userData = await getRepo(UserRepository).getUserInfo(userPk);
            const data = { ...userData };
            // db토큰이랑 클라이언트 토큰일치 확인
            if (dbToken === clientToken) {
                result.accessToken = jwt.sign(data, loginSecretKey.secretKey, loginSecretKey.options);
                result.refreshToken = jwt.sign({ userPk: userPk }, loginSecretKey.secretKey, loginSecretKey.options);
                await getRepo(RefreshRepository).updateRefreshToken(userPk, result.refreshToken);
                result.msg = 'success';
            } else {
                result.msg = 'error [tokenExits]';
            }
        } catch (error) {
            const err = error as jwt.VerifyErrors;
            if (err.name === 'TokenExpiredError') {
                result.msg = 'error [expired]';
            } else if (err.name === 'JsonWebTokenError') {
                result.msg = 'error [tokenError]';
            } else {
                result.msg = 'error [' + err.name + ']';
            }
        }
        return result;
    }
}
