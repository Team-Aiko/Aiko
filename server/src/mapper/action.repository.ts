import Action from 'src/entity/action.entity';
import { AikoError, Pagination, propsRemover } from 'src/Helpers';
import { IItemBundle } from 'src/interfaces/MVC/workMVC';
import { Brackets, EntityRepository, Repository } from 'typeorm';
import { IPaginationBundle } from 'src/interfaces/MVC/workMVC';
import { Company, Department } from 'src/entity';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { stackAikoError } from 'src/Helpers/functions';

enum actionErr {
    createActionItem = 1,
    findActionItem = 2,
    deleteActionItem = 3,
    updateItem = 4,
    viewItems = 5,
    getItemCnt = 6,
    todayAction = 7,
}

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
                    STEP_PK: bundle.STEP_PK,
                    TITLE: bundle.TITLE,
                    DESCRIPTION: bundle.DESCRIPTION,
                    START_DATE: bundle.START_DATE,
                    DUE_DATE: bundle.DUE_DATE,
                    IS_FINISHED: 0,
                    CREATE_DATE: Math.floor(new Date().getTime() / 1000),
                })
                .execute();
        } catch (err) {
            throw stackAikoError(
                err,
                'action/createActionItem',
                500,
                headErrorCode.actionDB + actionErr.createActionItem,
            );
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
            throw stackAikoError(err, 'action/findActionItem', 500, headErrorCode.actionDB + actionErr.findActionItem);
        }

        return item;
    }

    async deleteActionItem(ACTION_PK: number) {
        let flag = false;

        try {
            await this.createQueryBuilder().delete().where('ACTION_PK = :ACTION_PK', { ACTION_PK }).execute();
            flag = true;
        } catch (err) {
            throw stackAikoError(
                err,
                'action/deleteActionItem',
                500,
                headErrorCode.actionDB + actionErr.deleteActionItem,
            );
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
            throw stackAikoError(err, 'action/updateItem', 500, headErrorCode.actionDB + actionErr.updateItem);
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
    async viewItems(USER_PK: number, COMPANY_PK: number, pg: Pagination) {
        try {
            let fracture = this.createQueryBuilder('a')
                .leftJoinAndSelect('a.department', 'department')
                .leftJoinAndSelect('a.owner', 'owner')
                .leftJoinAndSelect('a.assigner', 'assigner')
                .leftJoinAndSelect('a.step', 'step')
                .leftJoinAndSelect('a.priority', 'priority');

            if (USER_PK !== -1 && USER_PK > 0) fracture = fracture.where('a.USER_PK = :USER_PK', { USER_PK });

            const itemList = await fracture
                .orderBy('a.DUE_DATE', 'DESC')
                .offset(pg.offset)
                .limit(pg.feedPerPage)
                .getMany();

            const deleteInfo = [
                'PASSWORD',
                'SALT',
                'IS_DELETED',
                'IS_VERIFIED',
                'CREATE_DATE',
                'USER_PROFILE_PK',
                'COUNTRY_PK',
            ];
            return itemList.map((item) => {
                item.owner = propsRemover(item.owner, ...deleteInfo);

                item.assigner = propsRemover(item.assigner, ...deleteInfo);
                return item;
            });
        } catch (err) {
            throw stackAikoError(err, 'action/viewItems', 500, headErrorCode.actionDB + actionErr.viewItems);
        }
    }

    async getItemCnt(USER_PK: number, COMPANY_PK: number) {
        try {
            let fracture = this.createQueryBuilder('a')
                .innerJoin(Department, 'd', 'd.COMPANY_PK = :COMPANY_PK', { COMPANY_PK })
                .where('a.DEPARTMENT_PK = d.DEPARTMENT_PK');

            if (USER_PK !== -1 && USER_PK > 0) {
                // 유저를 특정하는 경우.
                fracture = fracture.andWhere('a.USER_PK = :USER_PK', { USER_PK });
            }

            return await fracture.getCount();
        } catch (err) {
            throw stackAikoError(err, 'action/getItemCnt', 500, headErrorCode.actionDB + actionErr.getItemCnt);
        }
    }

    async todayAction(userPK: number, departmentPK: number, day: number, isAll: boolean) {
        try {
            const criticalInfo = ['PASSWORD', 'IS_DELETED', 'SALT', 'IS_VERIFIED'];
            const oneDayTimeInterval = 60 * 60 * 24;
            const targetServerDay = Math.floor(day / oneDayTimeInterval) * oneDayTimeInterval;

            let fraction = this.createQueryBuilder('a')
                .leftJoinAndSelect('a.owner', 'owner')
                .leftJoinAndSelect('a.assigner', 'assigner')
                .leftJoinAndSelect('a.department', 'department1')
                .leftJoinAndSelect('owner.department', 'department2')
                .leftJoinAndSelect('assigner.department', 'department3')
                .where(`a.USER_PK = ${userPK}`)
                .andWhere(`a.DEPARTMENT_PK = ${departmentPK}`)
                .andWhere(`a.START_DATE <= ${targetServerDay}`)
                .andWhere(`a.DUE_DATE > ${targetServerDay + oneDayTimeInterval}`);
            fraction = isAll ? fraction : fraction.andWhere(`a.IS_FINISHED = 0`);

            return (await fraction.getMany()).map((action) => {
                action.assigner = propsRemover(action.assigner, ...criticalInfo);
                action.owner = propsRemover(action.owner, ...criticalInfo);

                return action;
            });
        } catch (err) {
            throw stackAikoError(err, 'action/todayAction', 500, headErrorCode.actionDB + actionErr.todayAction);
        }
    }
}
