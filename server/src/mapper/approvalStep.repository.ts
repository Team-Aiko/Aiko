import ApprovalStep from 'src/entity/approvalStep.entity';
import { EntityRepository, InsertResult, Repository, TransactionManager, EntityManager } from 'typeorm';
import { AikoError, unixTimeStamp, propsRemover } from 'src/Helpers';

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
    async detailStep(departmentPk: number, comPk: number, framePk: number) {
        try {
            const result = await this.createQueryBuilder('n')
                .select(['n.AF_PK', 'n.STEP_LEVEL', 'n.DECISION', 'n.SIGN_DATE', 'n.STEP_STATUS'])
                .leftJoinAndSelect('n.asUser', 'asUser')
                .andWhere('n.AF_PK =:afPk', { afPk: `${framePk}` })
                .getMany();
            for (const num in result) {
                const name = {
                    USER_NAME: result[num].asUser?.FIRST_NAME + ' ' + result[num].asUser?.LAST_NAME,
                };
                const props = ['asUser'];
                result[num] = propsRemover(result[num], ...props);
                result[num] = Object.assign(result[num], name);
            }
            console.log(result);
            return result;
        } catch (err) {
            console.log(err);
        }
    }
    async assignApproval(@TransactionManager() manager: EntityManager, framePk, userPk, stepStatus, decision) {
        const time = unixTimeStamp();
        const result = await manager.update(
            ApprovalStep,
            { AF_PK: framePk, USER_PK: userPk },
            { DECISION: decision, SIGN_DATE: time },
        );
        return result;
    }
    async checkApprovalStep(afPk: number) {
        const result = await this.createQueryBuilder('n')
            .select('MAX(n.STEP_LEVEL) AS MAX_LEVEL')
            .andWhere('n.DECISION = 1')
            .andWhere('n.AF_PK =:afPk', { afPk: `${afPk}` })
            .getRawOne();
        return result.MAX_LEVEL;
    }

    //권한확인

    async checkAuthList(afPk: number, userPk: number) {
        const result = await this.createQueryBuilder('n')
            .select(['n.USER_PK', 'n.AF_PK'])
            .andWhere('n.USER_PK =:userPk', { userPk: `${userPk}` })
            .andWhere('n.AF_PK =:afPk', { afPk: `${afPk}` })
            .getOne();
        console.log(result);
    }
}
