import ApprovalStep from 'src/entity/approvalStep';
import { EntityRepository, InsertResult, Repository, TransactionManager, EntityManager } from 'typeorm';

@EntityRepository(ApprovalStep)
export default class ApprovalStepRepository extends Repository<ApprovalStep> {
    async createApprovalStep() {

    }
}
