import { EntityRepository, InsertResult, Repository, TransactionManager, EntityManager } from 'typeorm';
import ApprovalFrame from 'src/entity/approvalFrame.entity';
import { unixTimeStamp } from 'src/Helpers';

@EntityRepository(ApprovalFrame)
export default class ApprovalFrameRepository extends Repository<ApprovalFrame> {
    async createApproval(
        @TransactionManager() manager: EntityManager,
        title: string,
        content: string,
        comPk: number,
        departmentPk: number,
        userPk: number,
    ) {
        const time = unixTimeStamp();
        console.log(comPk);
        const result = await manager.insert(ApprovalFrame, {
            USER_PK: userPk,
            TITLE: title,
            CONTENT: content,
            COMPANY_PK: comPk,
            AC_PK: 0, //TEST
            DEPARTMENT_PK: departmentPk,
            CURRENT_STEP_LEVEL: 0,
            START_DATE: time,
        });
        return result.identifiers[0];
    }
    async list(userPk: number, stepLevels: any, view: string) {
        if (view == 'all') {
            console.log(userPk);
            const result = await this.createQueryBuilder()
                .select()
                .where('USER_PK =:userPk', { userPk: `${userPk}` })
                .getMany();
            return result;
        }
    }
}
