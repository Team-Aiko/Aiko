import ApprovalStep from 'src/entity/approvalStep.entity';
import { EntityRepository, InsertResult, Repository, TransactionManager, EntityManager } from 'typeorm';
import { AikoError, unixTimeStamp } from 'src/Helpers';

@EntityRepository(ApprovalStep)
export default class ApprovalStepRepository extends Repository<ApprovalStep> {
    async createApprovalStep(
        @TransactionManager() manager: EntityManager,
        insertId: number,
        stepStatus: number,
        userPk: number,
        stepLevel: number,
    ) {
        return await manager.insert(ApprovalStep, {
            AF_PK: insertId,
            USER_PK: userPk,
            STEP_LEVEL: stepLevel,
            STEP_STATUS: stepStatus,
            DECISION: 0,
        });
    }

    async needToDoPks(userPk: number, afPk: number, stepLevel: number) {
        try {
            const result = await this.createQueryBuilder('n')
                .select(['n.AF_PK'])
                .andWhere('n.AF_PK =:afPk', { afPk: `${afPk}` })
                .andWhere('USER_PK =:userPk', { userPk: `${userPk}` })
                .andWhere('n.STEP_LEVEL =:stepLevel', { stepLevel: `${stepLevel}` })
                .andWhere('n.DECISION = 0')
                .getOne();
            return result;
        } catch (err) {
            console.log(err);
        }
        // result = propsRemover(result, 'user');
        // result = Object.assign(result, name);
    }
}
