import express from 'express';
import companyService from '../services/companyService';

const router = express.Router();

router.get('/getCompanyList', (req, res) => {
    const {str} = req.query;
    companyService.getCompanyList(str as string, res);
});

router.get('/getOrganizationTree', (req, res) => {
    const {id} = req.query;
    companyService.getOrganizationTree(Number(id), res);
});

router.get('/getDepartmentMembers', (req, res) => {
    const {deptId} = req.query;
    companyService.getDepartmentMembers(Number(deptId), res);
});

export default router;
