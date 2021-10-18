/* eslint-disable no-unused-vars */
// * http
import { query, Response } from 'express';
// * Database
import { Injectable } from '@nestjs/common';
import { getManager, getConnection } from 'typeorm';
import { ResultSetHeader } from 'mysql2';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    UserRepository,
    LoginAuthRepository,
    CountryRepository,
    ResetPwRepository,
    CompanyRepository,
    DepartmentRepository,
} from '../entity';
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

// * mailer
const emailConfig = config.get<IMailConfig>('MAIL_CONFIG');
const botEmailAddress = config.get<IMailBotConfig>('MAIL_BOT').botEmailAddress;
const smtpTransporter = nodemailer.createTransport(smtpPool(emailConfig));

// * pbkdf2
const hasher = pbkdf2();

@Injectable()
export default class AccountService implements IAccountService {
    constructor(
        @InjectRepository(UserRepository)
        private userRepo: Repository<UserRepository>,
        @InjectRepository(LoginAuthRepository)
        private loginAuthRepo: Repository<LoginAuthRepository>,
        @InjectRepository(CountryRepository)
        private countryRepo: Repository<CountryRepository>,
        @InjectRepository(ResetPwRepository)
        private resetPwRepo: Repository<ResetPwRepository>,
        @InjectRepository(CompanyRepository)
        private companyRepo: Repository<CompanyRepository>,
        @InjectRepository(DepartmentRepository)
        private departmentRepo: Repository<DepartmentRepository>,
    ) {}

    checkDuplicateEmail(email: string, res: Response<any, Record<string, any>>): void {
        const result = this.userRepo.count({ EMAIL: email });
        result.then((data) => res.send(data));
    }
    getCountryList(str: string, res: Response<any, Record<string, any>>): void {
        const result = this.countryRepo
            .createQueryBuilder('c')
            .where('c.COUNTRY_NAME like :countryName', { countryName: `${str}%` })
            .getMany();
        result.then((data) => res.send(data));
    }
    signup(data: ISignup, imageRoute: string, res: Response<any, Record<string, any>>) {
        (async () => {
            const [hash, salt] = await new Promise<string[]>((resolve, reject) => {
                hasher({ password: data.pw }, (err, pw, salt, hash) => {
                    if (err) throw err;

                    resolve([hash, salt]);
                });
            });
            const queryRunner = getConnection().createQueryRunner();
            queryRunner.startTransaction();
            try {
                let userPK: number;
                if (data.position === 0) {
                    const result1 = await this.companyRepo
                        .createQueryBuilder()
                        .insert()
                        .into(CompanyRepository)
                        .values({
                            COMPANY_NAME: data.companyName,
                            CREATE_DATE: Math.floor(new Date().getTime() / 1000),
                        })
                        .execute();
                    const rawData1: ResultSetHeader = result1.raw;
                    const COMPANY_PK = rawData1.insertId as number;
                    const result2 = await this.departmentRepo
                        .createQueryBuilder()
                        .insert()
                        .into(DepartmentRepository)
                        .values({ DEPARTMENT_NAME: 'OWNER', COMPANY_PK: COMPANY_PK, DEPTH: 0 })
                        .execute();
                    const rawData2: ResultSetHeader = result2.raw;
                    const DEPARTMENT_PK = rawData2.insertId as number;
                    const result3 = await this.userRepo
                        .createQueryBuilder()
                        .insert()
                        .into(UserRepository)
                        .values({
                            NICKNAME: data.nickname,
                            PASSWORD: hash,
                            SALT: salt,
                            COMPANY_PK: COMPANY_PK,
                            DEPARTMENT_PK: DEPARTMENT_PK,
                            EMAIL: data.email,
                            FIRST_NAME: data.firstName,
                            LAST_NAME: data.lastName,
                            COUNTRY_PK: data.countryPK,
                            CREATE_DATE: Math.floor(new Date().getTime() / 1000),
                            IS_VERIFIED: 0,
                            IS_DELETED: 0,
                            TEL: data.tel,
                            PROFILE_FILE_NAME: imageRoute,
                        })
                        .execute();
                    userPK = (result3.raw as ResultSetHeader).insertId as number;
                } else if (data.position === 1) {
                    const result = await this.userRepo
                        .createQueryBuilder()
                        .insert()
                        .into(UserRepository)
                        .values({
                            NICKNAME: data.nickname,
                            PASSWORD: hash,
                            SALT: salt,
                            FIRST_NAME: data.firstName,
                            LAST_NAME: data.lastName,
                            EMAIL: data.email,
                            TEL: data.tel,
                            COUNTRY_PK: data.countryPK,
                            CREATE_DATE: Math.floor(new Date().getTime() / 1000),
                            COMPANY_PK: data.companyPK,
                            PROFILE_FILE_NAME: imageRoute,
                        })
                        .execute();
                    userPK = (result.raw as ResultSetHeader).insertId as number;
                }

                // * email auth
                const uuid = v1();
                this.loginAuthRepo
                    .createQueryBuilder('l')
                    .insert()
                    .into(LoginAuthRepository)
                    .values({ USER_PK: userPK, UUID: uuid })
                    .execute();
                const mailOpt: SendMailOptions = {
                    from: botEmailAddress,
                    to: data.email,
                    subject: '[Aiko] Auth Email',
                    text: `Please link to this address: http://localhost:5000/account/login-auth?id=${uuid}`,
                };

                res.send(
                    await new Promise((resolve, reject) => {
                        let flag = false;

                        smtpTransporter.sendMail(mailOpt, async (err, response) => {
                            if (err) throw err;

                            smtpTransporter.close();
                            flag = true;
                            resolve(flag);
                        });
                    }),
                );

                await queryRunner.commitTransaction();
            } catch (err) {
                await queryRunner.rollbackTransaction();
                throw err;
            } finally {
                await queryRunner.release();
            }
        })();
    }
    grantLoginAuth(id: string, res: Response<any, Record<string, any>>): void {
        (async () => {
            console.log('uuid = ', id);
            const queryRunner = getConnection().createQueryRunner();
            await queryRunner.startTransaction();
            try {
                const result1 = await this.loginAuthRepo
                    .createQueryBuilder('l')
                    .where('l.UUID = uuid', { uuid: id })
                    .getOne();
                console.log('result1 = ', result1);

                getConnection()
                    .createQueryBuilder()
                    .update(UserRepository)
                    .set({ IS_VERIFIED: 1 })
                    .where('USER_PK = :userPK', { userPK: result1.USER_PK })
                    .execute();

                await queryRunner.commitTransaction();
                res.send(true);
            } catch (err) {
                await queryRunner.rollbackTransaction();
                res.send(false);
            } finally {
                await queryRunner.release();
            }
        })();
    }
    login(data: Pick<UserTable, 'NICKNAME' | 'PASSWORD'>, res: Response<any, Record<string, any>>): void {
        (async () => {
            const result = await getConnection()
                .createQueryBuilder(UserRepository, 'U')
                .select([
                    'U.FIRST_NAME',
                    'U.LAST_NAME',
                    'U.EMAIL',
                    'U.TEL',
                    'U.COMPANY_PK',
                    'U.DEPARTMENT_PK',
                    'U.PASSWORD',
                    'U.SALT',
                    'U.NICKNAME',
                    'U.USER_PK',
                ])
                .leftJoinAndSelect('U.company', 'company')
                .leftJoinAndSelect('U.department', 'department')
                .where('U.NICKNAME = :nickname', { nickname: data.NICKNAME })
                .andWhere('U.IS_VERIFIED = :isVerified', { isVerified: 1 })
                .getOneOrFail();

            hasher({ password: data.PASSWORD, salt: result.SALT }, (err, pw, salt, hash) => {
                const flag = result.PASSWORD === hash;

                if (!flag) {
                    const packet: BasePacket = {
                        header: false,
                    };
                    res.send(packet);
                    return;
                }

                // remove security informations
                result.PASSWORD = '';
                result.SALT = '';

                const packet: SuccessPacket = {
                    header: flag,
                    userInfo: { ...result },
                };

                res.cookie('TOKEN', this.generateLoginToken(result), { httpOnly: true, maxAge: expireTime.THREE_HOUR });
                res.send(packet);
            });
        })();
    }
    logout(res: Response<any, Record<string, any>>): void {
        res.cookie('TOKEN', null);
        res.send(true);
    }
    findNickname(email: string, res: Response<any, Record<string, any>>): void {
        try {
            const result = this.userRepo
                .createQueryBuilder('u')
                .where('u.EMAIL = :email', { email: email })
                .getOneOrFail();

            result.then((data) => {
                const { NICKNAME } = data;
                const mailOpt = {
                    from: botEmailAddress,
                    to: email,
                    subject: '[Aiko] We will show you your nickname!',
                    text: `Your Nickname: ${NICKNAME}`,
                };

                smtpTransporter.sendMail(mailOpt, (err, response) => {
                    if (err) {
                        res.send(false);
                        throw err;
                    }

                    console.log('Message send: ', response);
                    smtpTransporter.close();
                    res.send(true);
                });
            });
        } catch (err) {
            res.send(false);
            throw err;
        }
    }
    requestResetPassword(email: string, res: Response<any, Record<string, any>>): void {
        (async () => {
            const queryRunner = getConnection().createQueryRunner();
            await queryRunner.startTransaction();

            try {
                const result1 = await this.userRepo
                    .createQueryBuilder('u')
                    .where('u.EMAIL = :email', { email: email })
                    .getOneOrFail();
                const { USER_PK } = result1;
                const uuid = v1();
                const result2 = await this.resetPwRepo
                    .createQueryBuilder('r')
                    .where('r.USER_PK = USER_PK', { USER_PK: USER_PK })
                    .getMany();
                if (result2.length > 5) throw 'EXCEED_MAXIMUM_TRY'; // 5회 초과시 요청불가

                // insert request info
                this.resetPwRepo
                    .createQueryBuilder()
                    .insert()
                    .into(ResetPwRepository)
                    .values({ USER_PK: USER_PK, UUID: uuid })
                    .execute();

                // sending mail process
                const mailOpt: SendMailOptions = {
                    from: botEmailAddress,
                    to: email,
                    subject: '[Aiko] We got a request of reset password.',
                    text: `
                    IF YOU DO NOT REQUEST THIS, JUST IGNORE.

                    Please link to this address: http://localhost:3000/reset-password/${uuid}`,
                };

                res.send(
                    await new Promise((resolve, reject) => {
                        let flag = false;
                        smtpTransporter.sendMail(mailOpt, async (err, response) => {
                            if (err) throw err;

                            smtpTransporter.close();
                            flag = true;
                            resolve(flag);
                        });
                    }),
                );

                await queryRunner.commitTransaction();
            } catch (err) {
                await queryRunner.rollbackTransaction();
                res.send(false);
                throw err;
            } finally {
                await queryRunner.release();
            }
        })();
    }
    resetPassword(uuid: string, password: string, res: Response<any, Record<string, any>>): void {
        (async () => {
            console.log(uuid, password);
            const queryRunner = getConnection().createQueryRunner();
            await queryRunner.startTransaction();
            try {
                const result1 = await this.resetPwRepo
                    .createQueryBuilder('r')
                    .where('r.UUID = :uuid', { uuid: uuid })
                    .getOneOrFail();
                const { USER_PK } = result1;

                res.send(
                    await new Promise((resolve, reject) => {
                        let flag = false;
                        hasher({ password: password }, async (err, pw, salt, hash) => {
                            if (err) throw err;

                            getConnection()
                                .createQueryBuilder()
                                .update(UserRepository)
                                .set({ PASSWORD: hash, SALT: salt })
                                .where('USER_PK = :userPK', { userPK: USER_PK })
                                .execute();
                            this.resetPwRepo
                                .createQueryBuilder()
                                .delete()
                                .where('USER_PK = :userPK', { userPK: USER_PK })
                                .execute();
                            flag = true;

                            resolve(flag);
                        });
                    }),
                );

                await queryRunner.commitTransaction();
            } catch (err) {
                res.send(false);
                await queryRunner.rollbackTransaction();
                throw err;
            } finally {
                await queryRunner.release();
            }
        })();
    }
    generateLoginToken(userData: UserRepository): string {
        const data = { ...userData };
        const token = jwt.sign(data, loginSecretKey.secretKey, loginSecretKey.options);

        return token;
    }
    getUser(userPK: number, TOKEN: string, res: Response<any, Record<string, any>>): void {
        this.userRepo
            .createQueryBuilder('u')
            .leftJoinAndSelect(DepartmentRepository, 'd', 'd.DEPARTMENT_PK = u.DEPARTMENT_PK')
            .where('u.USER_PK =  :userPK', { userPK: userPK })
            .getOne()
            .then((data) => {
                res.send(data);
            });
    }
    checkDuplicateNickname(nickname: string, res: Response<any, Record<string, any>>): void {
        const result = this.userRepo.count({ NICKNAME: nickname });
        result.then((count) => res.send(count.toString()));
    }
}