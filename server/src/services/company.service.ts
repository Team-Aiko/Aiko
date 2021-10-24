import CompanyRepository from 'src/mapper/company.repository';
import { getRepo } from 'src/Helpers/functions';
import { DepartmentRepository } from 'src/mapper';
import { AikoError } from 'src/Helpers/classes';
import { INewDepartment } from 'src/interfaces/MVC/companyMVC';
import AccountService from './account.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class CompanyService {
    constructor(private accountService: AccountService) {}

    // 회사 리스트 출력

    async list(companyName: string) {
        try {
            return await getRepo(CompanyRepository).list(companyName);
        } catch (err) {
            throw new AikoError('testError', 451, 500000);
        }
    }

    //부서 내 자식 리스트 재귀함수

    // 회사 부서 리스트 출력

    departmentList(payload) {
        // const companyPk = payload.companyPk;
        // let result = await getRepo(DepartmentRepository).departmentList(companyPk);
        // result = this.repeatChildren(result, result.length);
        // return result;
    }

    // 해당 부서 내 사원 리스트 출력
    async getDepartmentMembers(departmentPK: number, companyPK: number) {
        try {
            return await getRepo(DepartmentRepository).getDepartmentMembers(departmentPK, companyPK);
        } catch (err) {
            throw new AikoError('testError', 451, 500000);
        }
    }

    async createDepartment(bundle: INewDepartment) {
        let flag = false;

        try {
            const grants = await this.accountService.getGrantList(bundle.userPK);
            const isAdmin = grants.some((grant) => grant.USER_PK === bundle.userPK && grant.AUTH_LIST_PK === 1);

            if (isAdmin) {
                const { companyPK, departmentName, parentPK, parentDepth } = bundle;
                flag = await getRepo(DepartmentRepository).createDepartment({
                    companyPK,
                    departmentName,
                    parentPK,
                    parentDepth,
                });
            } else throw new AikoError("He isn't a admin", 500, 500011);
        } catch (err) {
            throw err;
        }

        return flag;
    }
}
