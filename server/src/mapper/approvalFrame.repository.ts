import { EntityRepository, InsertResult, Repository, TransactionManager, EntityManager } from 'typeorm';
import ApprovalFrame from 'src/entity/approvalFrame';

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
        try {
            return await this.manager.insert(ApprovalFrame, {
                TITLE: title,
                CONTENT: content,
                COMPANY_PK: comPk,
                DEPARTMENT_PK: departmentPk,
                USER_PK: userPk,
                CURRENT_STEP_LEVEL: 0,
            });
        } catch (err) {
            console.log(err);
        }
    }
}
