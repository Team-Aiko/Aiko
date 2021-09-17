import express from 'express';
import accountService from '../services/accountService';
import {ISignup} from '../database/jsonForms';
import multer from 'multer';

const upload = multer({dest: '../../upload', limits: {fileSize: 3 * 1024 * 1024}});

const router = express.Router();

router.get('/checkDuplicateNickname', (req, res) => {
    const {nickname} = req.query;
    accountService.checkDuplicateNickname(nickname as string, res);
});

router.get('/checkDuplicateEmail', (req, res) => {
    const {email} = req.query;
    accountService.checkDuplicateEmail(email as string, res);
});

router.get('/getCountryList', (req, res) => {
    const {str} = req.query;
    accountService.getCountryList(str as string, res);
});

router.post('/signup', upload.single('image'), (req, res) => {
    const data = JSON.parse(req.body.obj) as ISignup;
    const imageRoute = req.file ? `/images/${req.file.filename}` : null;
    console.log('🚀 ~ file: accountRouter.ts ~ line 28 ~ router.post ~ imageRoute', imageRoute);
    accountService.signup(data, imageRoute, res);
});

router.get('/grantLoginAuth', (req, res) => {
    const {id} = req.query as {id: string};
    accountService.grantLoginAuth(parseInt(id), res);
});

export default router;
