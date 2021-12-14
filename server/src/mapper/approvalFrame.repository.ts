import { EntityRepository, InsertResult, Repository, TransactionManager, EntityManager } from 'typeorm';
import ApprovalFrame from 'src/entity/approvalFrame.entity';

@EntityRepository(ApprovalFrame)
export default class ApprovalFrameRepository extends Repository<ApprovalFrame> {
    async createApproval(
        @TransactionManager() manager: EntityManager,
        title: string,
        content: string,
        departmentPk: number,
        comPk: number,
        userPk: number,
    ) {
        const result = await manager.insert(ApprovalFrame, {
            TITLE: title,
            CONTENT: content,
            COMPANY_PK: comPk,
            DEPARTMENT_PK: departmentPk,
            USER_PK: userPk,
            CURRENT_STEP_LEVEL: 0,
        });
        return result.identifiers[0];
    }
}
