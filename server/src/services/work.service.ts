import { Injectable } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
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
}
