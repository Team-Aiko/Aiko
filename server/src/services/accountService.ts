import {Response} from 'express';
import {RowDataPacket} from 'mysql2';
import {conn, pool} from '../database';

interface IAccountService {
    checkDuplicateNickname(nickname: string): Promise<void>;
}

const accountServce: IAccountService = {
    checkDuplicateNickname(nickname) {
        const sql = `select 
            COUNT(*)
        from
            USER_TABLE
        where
            NICKNAME = ?
        `;
        return (async () => {
            let data: any;

            await conn.query(sql, [nickname], (err, result, field) => {
                if (err) throw err;
                data = JSON.parse(JSON.stringify(result as RowDataPacket[]))[0];
                console.log('🚀 ~ file: accountService.ts ~ line 22 ~ conn.query ~ data', data);
            });

            return data;
        })();
    },
};

export default accountServce;
