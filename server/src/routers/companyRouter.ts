import express from 'express';
import companyService from '../services/companyService';
import { decodeToken, verifyToken } from '../services/_middlewares';
import { SelectData } from '../services/_types/accountTypes';

const router = express.Router();

router.get('/getCompanyList', (req, res) => {
    const { str } = req.query;
    companyService.getCompanyList(str as string, res);
});

router.get('/getOrganizationTree', decodeToken, (req, res) => {
    const { id } = req.query;
    const userInfo = req.body.jwtPayload as SelectData;
    companyService.getOrganizationTree(Number(id), userInfo, res);
});

router.get('/getDepartmentMembers', decodeToken, (req, res) => {
    const { deptId } = req.query;
    const userInfo = req.body.jwtPayload;
    companyService.getDepartmentMembers(Number(deptId), userInfo, res);
});

export default router;
