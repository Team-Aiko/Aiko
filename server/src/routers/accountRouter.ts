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
    accountService.grantLoginAuth(id, res);
});

router.post('/login', (req, res) => {
    const data = {
        NICKNAME: req.body.NICKNAME,
        PASSWORD: req.body.PASSWORD,
    };
    accountService.login(data, res);
});

router.post('/findNickname', (req, res) => {
    const {email} = req.body;
    console.log('🚀 ~ file:accountRouter.ts ~ line 47 ~ router.post ~ email', email);
    accountService.findNickname(email, res);
});

router.post('/requestResetPassword', (req, res) => {
    const {email} = req.body;
    accountService.requestResetPassword(email, res);
});

router.get('/resetPassword', (req, res) => {
    const {id} = req.query;
    accountService.resetPassword(id as string, res);
});

export default router;
