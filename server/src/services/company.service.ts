import CompanyRepository from 'src/mapper/company.repository';
import { getConnection } from 'typeorm';
import { getRepo } from 'src/Helpers/functions';
import { DepartmentRepository, UserRepository } from 'src/mapper';
import { AikoError } from 'src/Helpers/classes';

export default class CompanyService {
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
}
