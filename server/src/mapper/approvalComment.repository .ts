import { EntityRepository, InsertResult, Repository, TransactionManager, EntityManager } from 'typeorm';
import ApprovalFrame from 'src/entity/approvalFrame.entity';
import { unixTimeStamp, propsRemover } from 'src/Helpers';
import { ApprovalComment } from 'src/entity';

@EntityRepository(ApprovalComment)
export default class ApprovalCommentRepository extends Repository<ApprovalComment> {
    async getCommentAuth(userPk: number, departmentPk: number, comPk: number, framePk: number) {
        const result = await this.createQueryBuilder('c')
            .select(['c.ACM_PK'])
            .andWhere('c.AF_PK =: framePk', { framePk: `${framePk}` })
            .andWhere('c.COMPANY_PK =: comPk', { comPk: `${comPk}` })
            .andWhere('c.USER_PK =: userPk', { userPk: `${userPk}` })
            .getMany();
        return result;
    }
    async writeComment(
        userPk: number,
        departmentPk: number,
        comPk: number,
        framePk: number) { 
    
        }
}
