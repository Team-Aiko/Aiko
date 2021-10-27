import { Injectable } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { Grant } from 'src/entity';
import { AikoError, getRepo, isChiefAdmin } from 'src/Helpers';
import { IItemBundle } from 'src/interfaces/MVC/workMVC';
import { DepartmentRepository, UserRepository } from 'src/mapper';
import ActionRepository from 'src/mapper/action.repository';

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
            if (err instanceof AikoError) throw err;
        }
    }

    async deleteActionItem(ACTION_PK: number, DEPARTMENT_PK: number, grants: Grant[]) {
        let flag = false;

        try {
            const item = await getRepo(ActionRepository).findActionItem(ACTION_PK, DEPARTMENT_PK);
            // department filter
            if (item.DEPARTMENT_PK !== DEPARTMENT_PK) throw new AikoError('not appropriate department', 500, 500909);
            // Chief admin filter
            if (item.ASSIGNER_PK !== item.USER_PK) isChiefAdmin(grants);

            flag = await getRepo(ActionRepository).deleteActionItem(ACTION_PK);
        } catch (err) {
            if (err instanceof AikoError) throw err;
        }

        return flag;
    }

    async updateActionItem(bundle: IItemBundle) {
        let flag = false;

        try {
            // company filter
            const owner = await getRepo(UserRepository).getUserInfoWithUserPK(bundle.USER_PK);
            if (owner.COMPANY_PK !== bundle.COMPANY_PK) throw new AikoError('not same company', 500, 500129);

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
            if (err instanceof AikoError) throw err;
        }

        return flag;
    }

    async viewItems(USER_PK: number, COMPANY_PK: number) {
        try {
            // department selection
            const deptList = await getRepo(DepartmentRepository).getDepartmentList(COMPANY_PK);
            if (deptList.length <= 0) throw new AikoError('no dept list', 500, 500819);

            // item selection
            const deptIdList = deptList.map((dept) => dept.DEPARTMENT_PK);
            return await getRepo(ActionRepository).viewItems(USER_PK, deptIdList);
        } catch (err) {
            if (err instanceof AikoError) throw err;
        }
    }
}
