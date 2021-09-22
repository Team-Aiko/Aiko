import { DepartmentTable } from '../../database/tablesInterface';
import { Response } from 'express';

export interface ICompanyService {
    getCompanyList(str: string, res: Response): void;
    getOrganizationTree(id: number, res: Response): void;
    getDepartmentMembers(deptId: number, res: Response): void;
    bootStrapNode(arr: Node[], depth: number, sql: string, companyId: number): void;
}

export interface Node extends DepartmentTable {
    CHILDREN: Node[];
}
