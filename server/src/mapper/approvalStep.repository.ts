import ApprovalStep from 'src/entity/approvalStep.entity';
import { EntityRepository, InsertResult, Repository, TransactionManager, EntityManager } from 'typeorm';
import { AikoError } from 'src/Helpers';

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
}
