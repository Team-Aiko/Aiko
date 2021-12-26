import CompanyRepository from 'src/mapper/company.repository';
import { getRepo, propsRemover, stackAikoError } from 'src/Helpers/functions';
import { DepartmentRepository, UserRepository } from 'src/mapper';
import { AikoError, isChiefAdmin } from 'src/Helpers';
import { INewDepartment, IPermissionBundle } from 'src/interfaces/MVC/companyMVC';
import AccountService from './account.service';
import { Injectable } from '@nestjs/common';
import GrantRepository from 'src/mapper/grant.repository';
import { Department, Grant, User } from 'src/entity';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { notSameCompanyError } from 'src/Helpers/instance';

const criticalUserInfo = ['PASSWORD', 'SALT', 'IS_VERIFIED', 'IS_DELETED', 'CREATE_DATE'];
interface IExtendedUser extends User {
    departments: Partial<Department>;
}

enum companyError {
    list = 1,
    getDepartmentMembers = 2,
    createDepartment = 3,
    givePermission = 4,
    deleteDepartment = 5,
    updateDepartmentName = 6,
    searchMembers = 7,
    getDepartmentTree = 8,
    addMemberToDepartment = 9,
    getCompanyMemberList = 10,
}

@Injectable()
export default class CompanyService {
    constructor(private accountService: AccountService) {}

    // 회사 리스트 출력

    async list(companyName: string) {
        try {
            return await getRepo(CompanyRepository).list(companyName);
        } catch (err) {
            throw stackAikoError(err, 'CompanyService/list', 500, headErrorCode.company + companyError.list);
        }
    }

    // 해당 부서 내 사원 리스트 출력
    async getDepartmentMembers(departmentPK: number, companyPK: number) {
        try {
            return await getRepo(DepartmentRepository).getDepartmentMembers(departmentPK, companyPK);
        } catch (err) {
            throw stackAikoError(
                err,
                'CompanyService/getDepartmentMembers',
                500,
                headErrorCode.company + companyError.getDepartmentMembers,
            );
        }
    }

    async createDepartment(bundle: INewDepartment) {
        let flag = false;

        try {
            const grants = await this.accountService.getGrantList(bundle.userPK);
            isChiefAdmin(grants);

            const { companyPK, departmentName, parentPK, parentDepth } = bundle;
            flag = await getRepo(DepartmentRepository).createDepartment({
                companyPK,
                departmentName,
                parentPK,
                parentDepth,
            });
        } catch (err) {
            throw stackAikoError(
                err,
                'CompanyService/createDepartment',
                500,
                headErrorCode.company + companyError.createDepartment,
            );
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
            } else throw notSameCompanyError;
        } catch (err) {
            throw stackAikoError(
                err,
                'CompanyService/givePermission',
                500,
                headErrorCode.company + companyError.givePermission,
            );
        }

        return isSuccess;
    }

    async deleteDepartment(departmentPK: number, COMPANY_PK: number, grants: Grant[]) {
        try {
            isChiefAdmin(grants);
            return getRepo(DepartmentRepository).deleteDepartment(departmentPK, COMPANY_PK);
        } catch (err) {
            throw stackAikoError(
                err,
                'CompanyService/deleteDepartment',
                500,
                headErrorCode.company + companyError.deleteDepartment,
            );
        }
    }

    async updateDepartmentName(departmentPK: number, departmentName: string, companyPK: number, grants: Grant[]) {
        let flag = false;

        try {
            isChiefAdmin(grants);
            flag = await getRepo(DepartmentRepository).updateDepartmentName(departmentPK, departmentName, companyPK);
        } catch (err) {
            throw stackAikoError(
                err,
                'CompanyService/updateDepartmentName',
                500,
                headErrorCode.company + companyError.updateDepartmentName,
            );
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
            throw stackAikoError(
                err,
                'CompanyService/searchMembers',
                500,
                headErrorCode.company + companyError.searchMembers,
            );
        }

        return searchedUser;
    }

    async getDepartmentTree(COMPANY_PK: number, DEPARTMENT_PK: number) {
        try {
            return await getRepo(DepartmentRepository).getDepartmentTree(COMPANY_PK, DEPARTMENT_PK);
        } catch (err) {
            throw stackAikoError(
                err,
                'CompanyService/getDepartmentTree',
                500,
                headErrorCode.company + companyError.getDepartmentTree,
            );
        }
    }

    async addMemberToDepartment(companyPK: number, departmentPK: number, userPK: number, grants: Grant[]) {
        try {
            // auth filter
            isChiefAdmin(grants);
            return await getRepo(UserRepository).addMemberToDepartment(companyPK, departmentPK, userPK);
        } catch (err) {
            throw stackAikoError(
                err,
                'CompanyService/addMemberToDepartment',
                500,
                headErrorCode.company + companyError.addMemberToDepartment,
            );
        }
    }

    async getCompanyMemberList(companyPK: number) {
        try {
            return await getRepo(UserRepository).getCompanyMemberList(companyPK);
        } catch (err) {
            throw stackAikoError(
                err,
                'CompanyService/getCompanyMemberList',
                500,
                headErrorCode.company + companyError.getCompanyMemberList,
            );
        }
    }
}
