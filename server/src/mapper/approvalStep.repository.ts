import ApprovalStep from 'src/entity/approvalStep.entity';
import { EntityRepository, InsertResult, Repository, TransactionManager, EntityManager } from 'typeorm';
import { AikoError, unixTimeStamp } from 'src/Helpers';

@EntityRepository(ApprovalStep)
export default class ApprovalStepRepository extends Repository<ApprovalStep> {
    async createApprovalStepOfAgreer(
        @TransactionManager() manager: EntityManager,
        insertId: number,
        agreerPk: number,
        stepLevel: number,
    ) {
        return await manager.insert(ApprovalStep, {
            AF_PK: insertId,
            USER_PK: agreerPk,
            STEP_LEVEL: stepLevel,
            STEP_STATUS: 'A',
            DECISION: 0,
        });
    }

    async createApprovalStepOfApprover(
        @TransactionManager() manager: EntityManager,
        insertId: number,
        approverPk: number,
        stepLevel: number,
    ) {
        return await manager.insert(ApprovalStep, {
            AF_PK: insertId,
            USER_PK: approverPk,
            STEP_LEVEL: stepLevel,
            STEP_STATUS: 'S',
            DECISION: 0,
        });
    }

    async list(userPk: number, comPk: number, departmentPk: number, view: string) {
        if (view == 'all') {
            console.log(userPk);
            const result = await this.createQueryBuilder('as')
                .select(['as.AF_PK', 'as.STEP_LEVEL'])
                .where('USER_PK =:userPk', { userPk: `${userPk}` })
                .getMany();
            return result;
        } else if (view == 'process') {
            console.log('pro');
        }

        // result = propsRemover(result, 'user');
        // result = Object.assign(result, name);
    }
}
