import express from 'express';
import {conn, pool} from '../database';
import accountService from '../services/accountService';

const router = express.Router();

router.get('/checkDuplicateNickname', (req, res) => {
    const {nickname} = req.query;
    accountService.checkDuplicateNickname(nickname as string, res);
});

export default router;
