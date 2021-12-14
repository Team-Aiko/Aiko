import { EntityRepository } from 'typeorm';
import ApprovalStep from 'src/entity/approvalStep';
import { Repository } from 'typeorm';

@EntityRepository(ApprovalStep)
export default class ApprovalStepRepository extends Repository<ApprovalStep> {}
