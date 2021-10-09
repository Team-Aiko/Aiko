import express from 'express';
import accountRouter from './accountRouter';
import companyRouter from './companyRouter';

const router = express.Router();

router.use('/account', accountRouter);
router.use('/company', companyRouter);

export default router;
