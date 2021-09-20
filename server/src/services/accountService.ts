import {json, Response} from 'express';
import {RowDataPacket} from 'mysql2';
import {conn, pool} from '../database';
import {UserTable} from '../database/tablesInterface';
import {ISignup} from '../database/jsonForms';
import {CountryTable, LoginAuthTable, ResetPwTable} from '../database/tablesInterface';
import nodemailer from 'nodemailer';
import smtpPool from 'nodemailer-smtp-pool';
import {v1} from 'uuid';
import fs from 'fs';
import pbkdf2Password from 'pbkdf2-password';

// * mailer
const emailConfig = JSON.parse(fs.readFileSync(__dirname + '/mailConfig.json', 'utf8')) as smtpPool.SmtpPoolOptions;
const smtpTransporter = nodemailer.createTransport(smtpPool(emailConfig));

// * password security
const hasher: IHasher = pbkdf2Password();
interface HasherCallback {
    (err: any, pw: string, salt: string, hash: string): void;
}
interface IHasher {
    (pwObj: {password: string; salt?: string}, callback: HasherCallback): void;
}

interface IPacket {
    header: boolean;
    USER_PK: number | undefined;
    NICKNAME: string | undefined;
    COMPANY_PK: number | undefined;
}

interface IAccountService {
    checkDuplicateNickname(nickname: string, res: Response): void;
    checkDuplicateEmail(email: string, res: Response): void;
    getCountryList(str: string, res: Response): void;
    signup(data: ISignup, imageRoute: string | null, res: Response): any;
    grantLoginAuth(id: string, res: Response): void;
    login(data: Pick<UserTable, 'NICKNAME' | 'PASSWORD'>, res: Response): void;
    findNickname(email: string, res: Response): void;
    requestResetPassword(email: string, res: Response): void;
    resetPassword(uuid: string, password: string, res: Response): void;
}

const accountService: IAccountService = {
    checkDuplicateNickname(nickname, res) {
        const sql = `select 
            COUNT(*)
        from
            USER_TABLE
        where
            NICKNAME = ?`;

        conn.query(sql, [nickname], (err, result, field) => {
            if (err) throw err;
            const data = JSON.parse(JSON.stringify(result as RowDataPacket[]))[0];
            console.log('🚀 ~ file: accountService.ts ~ line 22 ~ conn.query ~ data', data);
            res.send(data);
        });
    },
    checkDuplicateEmail(email, res) {
        const sql = `select 
            COUNT(*)
        from
            USER_TABLE
        where
            EMAIL = ?`;

        conn.query(sql, [email], (err, result, field) => {
            if (err) throw err;

            const data = JSON.parse(JSON.stringify(result));
            console.log('🚀 ~ file: accountService.ts ~ line 38 ~ conn.query ~ data', data);
            res.send(data);
        });
    },
    getCountryList(str, res) {
        const sql = `select * from COUNTRY_TABLE where COUNTRY_NAME LIKE ?`;

        conn.query(sql, [str + '%'], (err, result, field) => {
            if (err) throw err;
            const rows = JSON.parse(JSON.stringify(result)) as CountryTable[];

            res.send(rows);
        });
    },
    signup(data, imageRoute, res) {
        console.log('메소드 진입');

        (async () => {
            const [hash, salt] = await new Promise<string[]>((resolve, reject) => {
                hasher({password: data.pw}, (err, pw, salt, hash) => {
                    if (err) throw err;

                    resolve([hash, salt]);
                });
            });
            const connection = await pool.getConnection();

            try {
                if (data.position === 0) {
                    const sql1 = `insert into COMPANY_TABLE (
                        COMPANY_NAME,
                        CREATE_DATE
                    ) VALUES (
                        ?,
                        ?
                    )`;
                    const sql2 = `select LAST_INSERT_ID()`;
                    const sql3 = `insert into DEPARTMENT_TABLE (DEPARTMENT_NAME, COMPANY_PK, DEPTH) values (?,?,?)`;
                    const sql4 = `insert into USER_TABLE (
                        NICKNAME,
                        PASSWORD,
                        SALT,
                        FIRST_NAME,
                        LAST_NAME,
                        EMAIL,
                        TEL,
                        COUNTRY,
                        CREATE_DATE,
                        COMPANY_PK,
                        PROFILE_FILE_NAME
                    ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`;

                    // insert company row
                    await connection.query(sql1, [data.companyName, Math.floor(new Date().getTime() / 1000)]);

                    // select company row pk
                    const [rows] = await connection.query(sql2);
                    const companyPk = JSON.parse(JSON.stringify(rows))[0]['LAST_INSERT_ID()'] as number;

                    // insert department row (owner)
                    await connection.query(sql3, ['OWNER', companyPk, 0]);

                    // insert user row
                    await connection.query(sql4, [
                        data.nickname,
                        hash,
                        salt,
                        data.firstName,
                        data.lastName,
                        data.email,
                        data.tel,
                        data.countryPK,
                        Math.floor(new Date().getTime() / 1000),
                        companyPk,
                        imageRoute,
                    ]);
                } else if (data.position === 1) {
                    const sql = `insert into USER_TABLE (
                        NICKNAME,
                        PASSWORD,
                        SALT,
                        FIRST_NAME,
                        LAST_NAME,
                        EMAIL,
                        TEL,
                        COUNTRY,
                        CREATE_DATE,
                        COMPANY_PK,
                        PROFILE_FILE_NAME
                    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    await connection.query(sql, [
                        data.nickname,
                        hash,
                        salt,
                        data.firstName,
                        data.lastName,
                        data.email,
                        data.tel,
                        data.countryPK,
                        Math.floor(new Date().getTime() / 1000),
                        data.companyPK,
                        imageRoute,
                    ]);
                }

                // * auth email process
                const sql = `select LAST_INSERT_ID()`;
                const [rows] = await connection.query(sql);
                const userPk = JSON.parse(JSON.stringify(rows))[0]['LAST_INSERT_ID()'] as number;
                const uuid = v1();
                const sql2 = `insert into LOGIN_AUTH_TABLE (USER_PK, UUID) values (?,?)`;

                await connection.query(sql2, [userPk, uuid]);

                const mailOpt = {
                    from: JSON.parse(fs.readFileSync(__dirname + '/emailBotAddress.json', 'utf8'))
                        .botEmailAddress as string,
                    to: data.email,
                    subject: '[Aiko] Auth Email',
                    text: `Please link to this address: http://localhost:5000/api/account/grantLoginAuth?id=${uuid}`,
                };

                smtpTransporter.sendMail(mailOpt, (err, response) => {
                    if (err) throw err;
                    console.log('Message send: ', response);
                    smtpTransporter.close();
                    connection.commit();
                    res.send(true);
                });
            } catch (e) {
                console.log(e);
                connection.rollback();
            } finally {
                connection.release();
            }
        })();
    },
    grantLoginAuth(id, res) {
        (async () => {
            const connection = await pool.getConnection();

            try {
                const sql1 = `select 
                    *
                from 
                    LOGIN_AUTH_TABLE 
                where
                    UUID = ?`;
                const [rows] = await connection.query(sql1, [id]);
                console.log('🚀 ~ file: accountService.ts ~ line 203 ~ rows', rows);
                const result = JSON.parse(JSON.stringify(rows))[0] as LoginAuthTable;

                const sql2 = `
                update USER_TABLE
                SET IS_VERIFIED = 1
                WHERE USER_PK = ?`;
                await connection.query(sql2, [result.USER_PK]);
                connection.commit();
                res.send(true);
            } catch (e) {
                connection.rollback();
                res.send(false);
            } finally {
                connection.release();
            }
        })();
    },
    login(data, res) {
        const sql = `select 
            USER_PK,
            NICKNAME,
            PASSWORD,
            SALT,
            COMPANY_PK,
            IS_VERIFIED
        from 
            USER_TABLE
        where
            NICKNAME = ?
            AND
            IS_VERIFIED = 1`;
        conn.query(sql, data.NICKNAME, (err, result, field) => {
            if (err) throw err;

            const selected = JSON.parse(JSON.stringify(result)) as Pick<
                UserTable,
                'USER_PK' | 'NICKNAME' | 'PASSWORD' | 'SALT' | 'IS_VERIFIED' | 'COMPANY_PK'
            >[];
            console.log('🚀 ~ file: accountService.ts ~ line 239 ~ conn.query ~ selected', selected);

            if (!selected.length) {
                const packet: IPacket = {
                    header: false,
                    NICKNAME: undefined,
                    USER_PK: undefined,
                    COMPANY_PK: undefined,
                };
                res.send(packet);
                return;
            }

            hasher({password: data.PASSWORD, salt: selected[0].SALT}, (arr, pw, salt, hash) => {
                const flag = selected[0].PASSWORD === hash;
                console.log(selected[0].PASSWORD);
                console.log(hash);

                const packet: IPacket = {
                    header: flag,
                    USER_PK: flag ? selected[0].USER_PK : undefined,
                    NICKNAME: flag ? selected[0].NICKNAME : undefined,
                    COMPANY_PK: flag ? selected[0].COMPANY_PK : undefined,
                };

                res.send(packet);
            });
        });
    },
    findNickname(email, res) {
        const sql = `select NICKNAME from USER_TABLE where email = ?`;

        conn.query(sql, [email], (err, result, field) => {
            if (err) {
                res.send(false);
                throw err;
            }

            const rows = JSON.parse(JSON.stringify(result)) as {NICKNAME: string}[];
            const mailOpt = {
                from: JSON.parse(fs.readFileSync(__dirname + '/emailBotAddress.json', 'utf8'))
                    .botEmailAddress as string,
                to: email,
                subject: '[Aiko] We will show you your nickname!',
                text: `Your Nickname: ${rows[0].NICKNAME}`,
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
    },
    requestResetPassword(email, res) {
        (async () => {
            const connection = await pool.getConnection();
            try {
                const sql = `select USER_PK from USER_TABLE where email = ?`;
                let [rows] = await connection.query(sql, [email]);
                const result = JSON.parse(JSON.stringify(rows)) as Pick<UserTable, 'USER_PK'>[];
                if (result.length <= 0) {
                    res.send(false);
                    throw 'NO_USER_INFO';
                }

                const userPk = result[0].USER_PK;
                console.log('🚀 ~ file: accountService.ts ~ line 333 ~ userPk', userPk);
                const uuid = v1();
                const sqlOne = `select * from RESET_PW_TABLE where USER_PK = ?`;
                [rows] = await connection.query(sqlOne, [userPk]);
                console.log('🚀 ~ file: accountService.ts ~ line 336 ~ rows', rows);

                if ((rows as RowDataPacket[]).length > 5) {
                    res.send(false);
                    throw 'EXCEED_MAXIMUM_TRY';
                } else {
                    const sqlTwo = `insert into RESET_PW_TABLE (USER_PK, UUID) values (?,?)`;
                    await connection.query(sqlTwo, [userPk, uuid]);
                }

                const mailOpt = {
                    from: JSON.parse(fs.readFileSync(__dirname + '/emailBotAddress.json', 'utf8'))
                        .botEmailAddress as string,
                    to: email,
                    subject: '[Aiko] We got a request of reset password.',
                    text: `
                    IF YOU DO NOT REQUEST THIS, JUST IGNORE.

                    Please link to this address: http://localhost:3000/reset-password/${uuid}`,
                };

                console.log('파트1');
                smtpTransporter.sendMail(mailOpt, (err, response) => {
                    if (err) {
                        res.send(false);
                        console.log('파트2');
                        throw err;
                    }

                    console.log('Message send: ', response);
                    smtpTransporter.close();
                    connection.commit();
                    res.send(true);
                    console.log('파트3');
                });
            } catch (e) {
                console.log(e);
                console.log('파트5');
                connection.rollback();
                res.send(false);
            } finally {
                connection.release();
            }
        })();
    },
    resetPassword(uuid, pw, res) {
        (async () => {
            const connection = await pool.getConnection();

            try {
                const sql1 = `select USER_PK from RESET_PW_TABLE where UUID = ?`;
                const [rows] = JSON.parse(JSON.stringify(await connection.query(sql1, [uuid]))) as {
                    USER_PK: number;
                }[][];
                console.log('🚀 ~ file: accountService.ts ~ line 389 ~ rows', rows);
                if (rows.length <= 0) throw 'NO_MATCHING_USER';

                const userPk = rows[0].USER_PK;
                console.log('🚀 ~ file: accountService.ts ~ line 393 ~ userPk', userPk);

                const sql2 = `update USER_TABLE
                    set PASSWORD = ?, SALT = ?
                    where USER_PK = ?`;
                const {hash, salt} = await new Promise<{hash: string; salt: string}>((resolve, reject) => {
                    hasher({password: pw}, (err, pw, salt, hash) => {
                        resolve({hash, salt});
                    });
                });
                console.log('🚀 ~ file: accountService.ts ~ line 399 ~ hash', hash);
                console.log('🚀 ~ file: accountService.ts ~ line 399 ~ salt', salt);

                await connection.query(sql2, [hash, salt, userPk]);

                const sql3 = `delete from RESET_PW_TABLE where USER_PK = ?`;
                await connection.query(sql3, [userPk]);

                connection.commit();
                res.send(true);
            } catch (e) {
                res.send(false);

                console.log(e);
                connection.rollback();
            } finally {
                connection.release();
            }
        })();
    },
};

export default accountService;
