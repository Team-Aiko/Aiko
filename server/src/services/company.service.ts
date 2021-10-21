import CompanyRepository from 'src/mapper/company.repository';
import { getRepo } from 'src/Helpers/functions';
import { DepartmentRepository, UserRepository } from 'src/mapper';

export default class CompanyService {
    // 회사 리스트 출력

    list(companyName: string) {
        return getRepo(CompanyRepository).list(companyName);
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

    employeeList(payload) {
        // const departmentPk = payload.departmentPk;
        // return getRepo(UserRepository).employeeList(departmentPk);
    }
}
