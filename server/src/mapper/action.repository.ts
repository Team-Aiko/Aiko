import Action from 'src/entity/action.entity';
import { AikoError, propsRemover } from 'src/Helpers';
import { IItemBundle } from 'src/interfaces/MVC/workMVC';
import {
    Brackets,
    EntityManager,
    EntityRepository,
    InsertResult,
    Repository,
    Transaction,
    TransactionManager,
} from 'typeorm';

@EntityRepository(Action)
export default class ActionRepository extends Repository<Action> {
    async createActionItem(bundle: IItemBundle) {
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

    async updateItem(item: Action) {
        let flag = false;

        try {
            // prop remove (due to join relation)
            propsRemover(item, 'priority', 'step');

            // update
            await this.createQueryBuilder()
                .update()
                .set({
                    ...item,
                })
                .where('ACTION_PK = :ACTION_PK', { ACTION_PK: item.ACTION_PK })
                .execute();

            flag = true;
        } catch (err) {
            console.error(err);
            throw new AikoError('action/updateItem', 500, 500999);
        }

        return flag;
    }

    /**
     * USER_PK가 없으면(undefined, null) 또는 -1이면 andWhere가 없어 해당 부서리스트의의 일감들을 보여줌
     * 부서리스트에 부서 하나만 넣으면 한 부서의 일감 리스트를 보여줌.
     * USER_PK가 있으면 해당 유저에게 할당된 일감들을 보여줌.
     * @param USER_PK
     * @param deptIdList
     * @returns
     */
    async viewItems(USER_PK: number, deptIdList: number[]) {
        let itemList: Action[] = [];

        try {
            await Promise.all(
                deptIdList.map(async (curr) => {
                    // basic query
                    let fracture = this.createQueryBuilder('a').where('a.DEPARTMENT_PK = :DEPARTMENT_PK', {
                        DEPARTMENT_PK: curr,
                    });

                    // target user filter
                    if (USER_PK !== -1 || !USER_PK) fracture = fracture.andWhere('a.USER_PK = :USER_PK', { USER_PK });

                    const items = await fracture.getMany();

                    if (items.length > 0) itemList = itemList.concat(items);

                    return true;
                }),
            );
        } catch (err) {
            console.error(err);
            throw new AikoError('action/viewItems', 500, 900563);
        }

        return itemList;
    }
}
