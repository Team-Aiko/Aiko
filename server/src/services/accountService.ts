import {json, Response} from 'express';
import {RowDataPacket} from 'mysql2';
import {conn, pool} from '../database';
import {ISignup} from '../database/jsonForms';
import {CountryTable, LoginAuthTable} from '../database/tablesInterface';
import nodemailer from 'nodemailer';
import smtpPool from 'nodemailer-smtp-pool';
import {v1} from 'uuid';
import fs from 'fs';

// * mailer
const emailConfig = JSON.parse(fs.readFileSync(__dirname + '/mailConfig.json', 'utf8')) as smtpPool.SmtpPoolOptions;
const smtpTransporter = nodemailer.createTransport(smtpPool(emailConfig));

// * password security
const pbkdf2Password = require('pbkdf2-password') as Function;
const hasher: IHasher = pbkdf2Password();
interface HasherCallback {
    (err: any, pw: string, salt: string, hash: string): void;
}
interface IHasher {
    (pwObj: {password: string}, callback: HasherCallback): void;
}

interface IAccountService {
    checkDuplicateNickname(nickname: string, res: Response): void;
    checkDuplicateEmail(email: string, res: Response): void;
    getCountryList(str: string, res: Response): void;
    signup(data: ISignup, imageRoute: string | null, res: Response): any;
    grantLoginAuth(id: number, res: Response): void;
}

const accountServce: IAccountService = {
    checkDuplicateNickname(nickname, res) {
        const sql = `select 
            COUNT(*)
        from
            USER_TABLE
        where
            NICKNAME = ?`;

        conn.query(sql, [nickname], (err, result, field) => {
            if (err) throw err;
            let data = JSON.parse(JSON.stringify(result as RowDataPacket[]))[0];
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
            const [hash, salt] = await new Promise<String[]>((resolve, reject) => {
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
                    const sql3 = `insert into USER_TABLE (
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
                    await connection.query(sql1, [data.companyName, Math.floor(new Date().getTime() / 1000)]);

                    const [rows] = await connection.query(sql2);
                    const companyPk = JSON.parse(JSON.stringify(rows))[0]['LAST_INSERT_ID()'] as number;

                    await connection.query(sql3, [
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
};

export default accountServce;
