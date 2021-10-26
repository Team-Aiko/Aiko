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
}
