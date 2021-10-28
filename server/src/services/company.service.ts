import CompanyRepository from 'src/mapper/company.repository';
import { getRepo, propsRemover } from 'src/Helpers/functions';
import { DepartmentRepository, UserRepository } from 'src/mapper';
import { AikoError, isChiefAdmin } from 'src/Helpers';
import { INewDepartment, IPermissionBundle } from 'src/interfaces/MVC/companyMVC';
import AccountService from './account.service';
import { Injectable } from '@nestjs/common';
import GrantRepository from 'src/mapper/grant.repository';
import { Department, Grant, User } from 'src/entity';

const criticalUserInfo = ['PASSWORD', 'SALT', 'IS_VERIFIED', 'IS_DELETED', 'CREATE_DATE'];
interface IExtendedUser extends User {
    departments: Partial<Department>;
}

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

    async givePermission(bundle: IPermissionBundle) {
        let isSuccess = false;
        try {
            const admin = await getRepo(UserRepository).getUserInfoWithUserPK(bundle.USER_PK);
            const targetMember = await getRepo(UserRepository).getUserInfoWithUserPK(bundle.targetUserPK);

            if (admin.COMPANY_PK === targetMember.COMPANY_PK) {
                // 현재는 1로 chief admin으로 고정되어 있으나 추후 확장성을 고려하여 설계하였음.
                // 따라서 나중에 1의 값을 프론트에게서 받은 값으로 바꿔 확장가능
                isChiefAdmin(bundle.grants); // admin 판별

                await getRepo(GrantRepository).grantPermission(1, targetMember.USER_PK);
                isSuccess = true;
            } else throw new AikoError('not same company error', 500, 500043);
        } catch (err) {
            if (err instanceof AikoError) throw err;
        }

        return isSuccess;
    }

    async deleteDepartment(departmentPK: number, COMPANY_PK: number, grants: Grant[]) {
        try {
            isChiefAdmin(grants);
            return getRepo(DepartmentRepository).deleteDepartment(departmentPK, COMPANY_PK);
        } catch (err) {
            throw err;
        }
    }

    async updateDepartmentName(departmentPK: number, departmentName: string, companyPK: number, grants: Grant[]) {
        let flag = false;

        try {
            isChiefAdmin(grants);
            flag = await getRepo(DepartmentRepository).updateDepartmentName(departmentPK, departmentName, companyPK);
        } catch (err) {
            throw err;
        }

        return flag;
    }

    async searchMembers(str: string, COMPANY_PK: number, grants: Grant[]) {
        let searchedUser: User[] = [];
        try {
            const users = await getRepo(UserRepository).searchMembers(str, COMPANY_PK);
            const depts = await getRepo(DepartmentRepository).searchDepartment(str, COMPANY_PK);
            // insert depts user info
            depts.forEach((department) => {
                department.users.forEach((user) => {
                    const one: IExtendedUser = {
                        ...user,
                        departments: {
                            DEPARTMENT_NAME: department.DEPARTMENT_NAME,
                        },
                    };

                    users.push(one);
                });
            });
            // remove critical user info
            users.forEach((user) => propsRemover(user, ...criticalUserInfo));
            searchedUser = users;
        } catch (err) {
            if (err instanceof AikoError) throw err;
        }

        return searchedUser;
    }

    async getDepartmentTree(COMPANY_PK: number, DEPARTMENT_PK: number) {
        try {
            return await getRepo(DepartmentRepository).getDepartmentTree(COMPANY_PK, DEPARTMENT_PK);
        } catch (err) {
            if (err instanceof AikoError) throw err;
        }
    }

    // * util functions

    isChiefAdmin(grants: Grant[]) {
        try {
            const isAdmin = grants.some((grant) => grant.AUTH_LIST_PK === 1);
            if (!isAdmin) throw new AikoError('NO_AUTHORIZATION', 500, 500321);
            else return isAdmin;
        } catch (err) {
            throw err;
        }
    }

    async addMemberToDepartment(companyPK: number, departmentPK: number, userPK: number, grants: Grant[]) {
        try {
            // auth filter
            isChiefAdmin(grants);
            return await getRepo(UserRepository).addMemberToDepartment(companyPK, departmentPK, userPK);
        } catch (err) {
            throw err;
        }
    }
}
