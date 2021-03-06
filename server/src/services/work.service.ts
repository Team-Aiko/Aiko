import { Injectable } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { Grant } from 'src/entity';
import { AikoError, getRepo, isChiefAdmin, Pagination } from 'src/Helpers';
import { stackAikoError } from 'src/Helpers/functions';
import { notSameCompanyError, notSameDepartmentError } from 'src/Helpers/instance';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { IItemBundle } from 'src/interfaces/MVC/workMVC';
import { IPaginationBundle } from 'src/interfaces/MVC/workMVC';
import { UserRepository } from 'src/mapper';
import ActionRepository from 'src/mapper/action.repository';

enum workServiceError {
    createActionItem = 1,
    deleteActionItem = 2,
    updateActionItem = 3,
    viewItems = 4,
    todayAction = 5,
}

@Injectable()
export default class WorkService {
    async createActionItem(bundle: IItemBundle) {
        try {
            // self assign
            if (!bundle.USER_PK) bundle.USER_PK = bundle.ASSIGNER_PK;
            // auth filter
            if (bundle.ASSIGNER_PK !== bundle.USER_PK) isChiefAdmin(bundle.grants);
            // company filter
            const owner = await getRepo(UserRepository).getUserInfoWithUserPK(bundle.USER_PK);
            if (owner.COMPANY_PK !== bundle.COMPANY_PK) throw new AikoError('not same company', 500, 500129);

            // create item
            const result = await getRepo(ActionRepository).createActionItem(bundle);

            return (result.raw as ResultSetHeader).insertId;
        } catch (err) {
            throw stackAikoError(
                err,
                'WorkService/createActionItem',
                500,
                headErrorCode.work + workServiceError.createActionItem,
            );
        }
    }

    async deleteActionItem(ACTION_PK: number, DEPARTMENT_PK: number, grants: Grant[]) {
        let flag = false;

        try {
            const item = await getRepo(ActionRepository).findActionItem(ACTION_PK, DEPARTMENT_PK);
            // department filter
            if (item.DEPARTMENT_PK !== DEPARTMENT_PK) throw notSameDepartmentError;
            // Chief admin filter
            if (item.ASSIGNER_PK !== item.USER_PK) isChiefAdmin(grants);

            flag = await getRepo(ActionRepository).deleteActionItem(ACTION_PK);
        } catch (err) {
            throw stackAikoError(
                err,
                'WorkService/deleteActionItem',
                500,
                headErrorCode.work + workServiceError.deleteActionItem,
            );
        }

        return flag;
    }

    async updateActionItem(bundle: IItemBundle) {
        let flag = false;

        try {
            // company filter
            const owner = await getRepo(UserRepository).getUserInfoWithUserPK(bundle.USER_PK);
            if (owner.COMPANY_PK !== bundle.COMPANY_PK) throw notSameCompanyError;

            // select original
            const item = await getRepo(ActionRepository).findActionItem(bundle.ACTION_PK, bundle.DEPARTMENT_PK);

            // Chief admin filter + change department
            if (item.ASSIGNER_PK !== item.USER_PK) {
                isChiefAdmin(bundle.grants);
                item.DEPARTMENT_PK = bundle.DEPARTMENT_PK;
            }

            // col name change
            for (let i = 0; i < bundle.updateCols.length; i += 1)
                if (bundle.updateCols[i] === 'OWNER_PK') bundle.updateCols[i] = 'USER_PK';

            // value change
            Object.keys(item).forEach((prop) => {
                bundle.updateCols.forEach((upCol) => {
                    if (prop === upCol) item[prop] = bundle[prop];
                });
            });

            // update item
            flag = await getRepo(ActionRepository).updateItem(item);
        } catch (err) {
            throw stackAikoError(
                err,
                'WorkService/updateActionItem',
                500,
                headErrorCode.work + workServiceError.updateActionItem,
            );
        }

        return flag;
    }

    async viewItems({ COMPANY_PK, USER_PK, currentPage, feedsPerPage, groupCnt }: IPaginationBundle) {
        try {
            const cnt = await getRepo(ActionRepository).getItemCnt(USER_PK, COMPANY_PK);
            const pag = new Pagination(currentPage, cnt, feedsPerPage, groupCnt);
            const result = { pag, items: await getRepo(ActionRepository).viewItems(USER_PK, COMPANY_PK, pag) };

            return result;
        } catch (err) {
            throw stackAikoError(err, 'WorkService/viewItems', 500, headErrorCode.work + workServiceError.viewItems);
        }
    }

    async todayAction(userPK: number, departmentPK: number, day: number, isAll: boolean) {
        try {
            return await getRepo(ActionRepository).todayAction(userPK, departmentPK, day, isAll);
        } catch (err) {
            throw stackAikoError(
                err,
                'WorkService/todayAction',
                500,
                headErrorCode.work + workServiceError.todayAction,
            );
        }
    }
}
