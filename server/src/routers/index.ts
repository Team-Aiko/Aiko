import express from 'express';
import accountRouter from './accountRouter';

const router = express.Router();

router.use('/account', accountRouter);

export default router;
