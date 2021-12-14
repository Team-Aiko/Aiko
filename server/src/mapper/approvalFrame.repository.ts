import { EntityRepository } from 'typeorm';
import ApprovalFrame from 'src/entity/approvalFrame';
import { Repository } from 'typeorm';

@EntityRepository(ApprovalFrame)
export default class ApprovalFrameRepository extends Repository<ApprovalFrame> {}
