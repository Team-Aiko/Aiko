// * Backend framework
import express from 'express';
// * Service
import accountService from '../services/accountService';
import { ISignup, IResetPw } from '../services/_types/accountTypes';
// * file middleware
import multer from 'multer';

const upload = multer({ dest: '../../upload', limits: { fileSize: 3 * 1024 * 1024 } });

const router = express.Router();

router.get('/checkDuplicateNickname', (req, res) => {
    const { nickname } = req.query;
    accountService.checkDuplicateNickname(nickname as string, res);
});

router.get('/checkDuplicateEmail', (req, res) => {
    const { email } = req.query;
    accountService.checkDuplicateEmail(email as string, res);
});

router.get('/getCountryList', (req, res) => {
    const { str } = req.query;
    accountService.getCountryList(str as string, res);
});

router.post('/signup', upload.single('image'), (req, res) => {
    const data = JSON.parse(req.body.obj) as ISignup;
    const imageRoute = req.file ? `/images/${req.file.filename}` : null;
    console.log('🚀 ~ file: accountRouter.ts ~ line 28 ~ router.post ~ imageRoute', imageRoute);
    accountService.signup(data, imageRoute, res);
});

router.get('/grantLoginAuth', (req, res) => {
    const { id } = req.query as { id: string };
    accountService.grantLoginAuth(id, res);
});

router.post('/login', (req, res) => {
    const data = {
        NICKNAME: req.body.NICKNAME,
        PASSWORD: req.body.PASSWORD,
    };
    accountService.login(data, res);
});

router.get('/logout', (req, res) => {
    accountService.logout(res);
});

router.post('/findNickname', (req, res) => {
    const { email } = req.body;
    accountService.findNickname(email, res);
});

router.post('/requestResetPassword', (req, res) => {
    const { email } = req.body;
    console.log('🚀 ~ file:accountRouter.ts ~ line 53 ~ router.post ~ email', email);
    accountService.requestResetPassword(email, res);
});

router.post('/resetPassword', (req, res) => {
    const { uuid, password }: IResetPw = req.body;
    accountService.resetPassword(uuid, password, res);
});

export default router;
