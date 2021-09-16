import {Response} from 'express';
import {RowDataPacket} from 'mysql2';
import {conn, pool} from '../database';
import {ISignup} from '../database/jsonForms';
import {CountryTable} from '../database/tablesInterface';
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
        if (data.header === 0) {
            // owner case
            (async () => {
                const [hash, salt] = await new Promise<String[]>((resolve, reject) => {
                    hasher({password: data.pw}, (err, pw, salt, hash) => {
                        if (err) throw err;

                        resolve([hash, salt]);
                    });
                });
                console.log('해셔통과');
                const connection = await pool.getConnection();
                try {
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

                    connection.commit();
                    res.send(true);
                } catch (e) {
                    console.log(e);
                    console.log('에러롤백');
                    connection.rollback();
                    res.send(false);
                } finally {
                    connection.release();
                }
            })();
        } else if (data.header === 1) {
            // member case
            (async () => {
                const [hash, salt] = await new Promise<String[]>((resolve, reject) => {
                    hasher({password: data.pw}, (err, pw, salt, hash) => {
                        if (err) throw err;

                        resolve([hash, salt]);
                    });
                });
                const connection = await pool.getConnection();
                try {
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

                    connection.commit();
                    res.send(true);
                } catch (e) {
                    console.log(e);
                    connection.rollback();
                    res.send(false);
                } finally {
                    connection.release();
                }
            })();
        }
    },
};

export default accountServce;
