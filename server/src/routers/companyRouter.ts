import express from 'express';
import companyService from '../services/companyService';
import { jwtMiddleware } from '../services/_middlewares';

const router = express.Router();

router.get('/getCompanyList', jwtMiddleware, (req, res) => {
    const { str } = req.query;
    companyService.getCompanyList(str as string, res);
});

router.get('/getOrganizationTree', jwtMiddleware, (req, res) => {
    const { id } = req.query;
    companyService.getOrganizationTree(Number(id), res);
});

router.get('/getDepartmentMembers', jwtMiddleware, (req, res) => {
    const { deptId } = req.query;
    companyService.getDepartmentMembers(Number(deptId), res);
});

export default router;
