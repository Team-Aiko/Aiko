import Action from 'src/entity/action.entity';
import { AikoError } from 'src/Helpers';
import { IActionCreateBundle } from 'src/interfaces/MVC/workMVC';
import { EntityManager, EntityRepository, InsertResult, Repository, Transaction, TransactionManager } from 'typeorm';

@EntityRepository(Action)
export default class ActionRepository extends Repository<Action> {
    async createActionItem(bundle: IActionCreateBundle) {
        console.log('🚀 ~ file: action.repository.ts ~ line 9 ~ ActionRepository ~ createActionItem ~ bundle', bundle);
        try {
            return await this.createQueryBuilder()
                .insert()
                .into(Action)
                .values({
                    ASSIGNER_PK: bundle.ASSIGNER_PK,
                    DEPARTMENT_PK: bundle.DEPARTMENT_PK,
                    USER_PK: bundle.USER_PK,
                    P_PK: bundle.P_PK,
                    STEP_PK: 1,
                    TITLE: bundle.TITLE,
                    DESCRIPTION: bundle.DESCRIPTION,
                    START_DATE: bundle.START_DATE,
                    DUE_DATE: bundle.DUE_DATE,
                    IS_FINISHED: 0,
                    CREATE_DATE: Math.floor(new Date().getTime() / 1000),
                })
                .execute();
        } catch (err) {
            console.error(err);
            throw new AikoError('action/createActionItem', 500, 500982);
        }
    }

    async findActionItem(ACTION_PK: number, DEPARTMENT_PK: number) {
        let item: Action;

        try {
            item = await this.createQueryBuilder('a')
                .where('a.ACTION_PK = :ACTION_PK', { ACTION_PK })
                .andWhere('a.DEPARTMENT_PK = :DEPARTMENT_PK', { DEPARTMENT_PK })
                .getOneOrFail();
        } catch (err) {
            console.error(err);
            throw new AikoError('action/findActionItem', 500, 500861);
        }

        return item;
    }

    async deleteActionItem(ACTION_PK: number) {
        let flag = false;

        try {
            await this.createQueryBuilder().delete().where('ACTION_PK = :ACTION_PK', { ACTION_PK }).execute();
            flag = true;
        } catch (err) {
            console.error(err);
            throw new AikoError('action/deleteActionItem', 500, 509212);
        }

        return flag;
    }
}
