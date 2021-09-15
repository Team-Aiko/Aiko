import express from 'express';
import {conn, pool} from '../database';
import accountService from '../services/accountService';

const router = express.Router();

router.get('/checkDuplicateNickname', (req, res) => {
    const {nickname} = req.query;
    const sql = `select 
        COUNT(*)
    from
        USER_TABLE
    where
        NICKNAME = ?`;

    conn.query(sql, [nickname], (err, result, field) => {
        if (err) throw err;

        const data = JSON.parse(JSON.stringify(result))[0];
        console.log('🚀 ~ file: accountService.ts ~ line 22 ~ conn.query ~ data', data);
        res.send(data);
    });
});

export default router;
