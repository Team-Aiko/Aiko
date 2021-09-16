import express from 'express';
import companyService from '../services/companyService';

const router = express.Router();

router.get('/getCompanyList', (req, res) => {
    const {str} = req.query;
    companyService.getCompanyList(str as string, res);
});

export default router;
