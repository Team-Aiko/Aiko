import { Injectable } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { Grant } from 'src/entity';
import { AikoError, getRepo, isChiefAdmin } from 'src/Helpers';
import { IActionCreateBundle } from 'src/interfaces/MVC/workMVC';
import ActionRepository from 'src/mapper/action.repository';

@Injectable()
export default class WorkService {
    async createActionItem(bundle: IActionCreateBundle) {
        try {
            // self assign
            if (!bundle.USER_PK) bundle.USER_PK = bundle.ASSIGNER_PK;
            // auth filter
            if (bundle.ASSIGNER_PK !== bundle.USER_PK) isChiefAdmin(bundle.grants);

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
}
