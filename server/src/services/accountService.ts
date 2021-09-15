import {Response} from 'express';
import {conn, pool} from '../database';

interface IAccountService {
    checkDuplicateNickname(nickname: string, res: Response): void;
}

const accountServce: IAccountService = {
    checkDuplicateNickname(nickname, res) {
        const sql = `select 
            COUNT(*)
        from
            USER_TABLE
        where
            NICKNAME = ?
        `;

        conn.query(sql, [nickname], (err, result, field) => {
            if (err) throw err;
            console.log(result);
        });
    },
};

export default accountServce;
