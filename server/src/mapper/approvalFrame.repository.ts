import { EntityRepository, InsertResult, Repository, TransactionManager, EntityManager } from 'typeorm';
import ApprovalFrame from 'src/entity/approvalFrame.entity';
import { unixTimeStamp, propsRemover } from 'src/Helpers';

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
            IS_DELETED: 0,
        });
        return result.identifiers[0];
    }
    async generateList(pks: number[]) {
        try {
            const result = await this.createQueryBuilder('n')
                .select(['n.TITLE', 'n.CONTENT'])
                .leftJoinAndSelect('n.afUser', 'afUser')
                .whereInIds(pks)
                .andWhere('n.IS_DELETED =:num', { num: 0 })
                .getMany();
            return result;
        } catch (err) {
            console.log(err);
        }
    }
    async doneList(comPk: number, departmentPk: number) {
        try {
            const result = await this.createQueryBuilder()
                .select()
                .andWhere('COMPANY_PK =:comPk', { comPk: `${comPk}` })
                .andWhere('DEPARTMENT_PK =:departmentPk', { departmentPk: `${departmentPk}` })
                .andWhere('END_DATE is not null')
                .andWhere('IS_DELETED =:num', { num: 0 })
                .getMany();
            return result;
        } catch (err) {
            console.log(err);
        }
    }
    async donePks(afPk: number, comPk: number, departmentPk: number) {
        try {
            const result = await this.createQueryBuilder('n')
                .select(['n.AF_PK'])
                .andWhere('COMPANY_PK =:comPk', { comPk: `${comPk}` })
                .andWhere('DEPARTMENT_PK =:departmentPk', { departmentPk: `${departmentPk}` })
                .andWhere('AF_PK =:afPk', { afPk: `${afPk}` })
                .andWhere('END_DATE is not null')
                .getOne();
            return result;
        } catch (err) {
            console.log(err);
        }
    }
    async doingPks(userPk: number, afPk: number, comPk: number, departmentPk: number) {
        try {
            const result = await this.createQueryBuilder('n')
                .select(['n.AF_PK'])
                .andWhere('COMPANY_PK =:comPk', { comPk: `${comPk}` })
                .andWhere('USER_PK =:userPk', { userPk: `${userPk}` })
                .andWhere('DEPARTMENT_PK =:departmentPk', { departmentPk: `${departmentPk}` })
                .andWhere('AF_PK =:afPk', { afPk: `${afPk}` })
                .getOne();
            return result;
        } catch (err) {
            console.log(err);
        }
    }
    async generateStepLevels(userPk: number, comPk: number, departmentPk: number) {
        try {
            const result = await this.createQueryBuilder('af')
                .select(['af.CURRENT_STEP_LEVEL', 'af.AF_PK'])
                .andWhere('COMPANY_PK =:comPk', { comPk: `${comPk}` })
                .andWhere('DEPARTMENT_PK =:departmentPk', { departmentPk: `${departmentPk}` })
                .andWhere('USER_PK =:userPk', { userPk: `${userPk}` })
                .distinct()
                .getMany();
            return result;
        } catch (err) {
            console.log(err);
        }
    }
    async detailFrame(departmentPk: number, comPk: number, framePk: number) {
        try {
            const result = await await this.createQueryBuilder('af')
                .select(['af.AF_PK', 'af.TITLE', 'af.CONTENT', 'af.START_DATE', 'af.END_DATE'])
                .leftJoinAndSelect('af.afUser', 'afUser')
                .andWhere('af.AF_PK =:framePk', { framePk: `${framePk}` })
                .andWhere('af.IS_DELETED =:num', { num: 0 }) //삭제? 회신?
                .andWhere('af.COMPANY_PK=:comPk', { comPk: `${comPk}` })
                .andWhere('af.DEPARTMENT_PK =:departmentPk', { departmentPk: `${departmentPk}` })
                .getMany();
            for (const num in result) {
                const name = {
                    USER_NAME: result[num].afUser?.FIRST_NAME + ' ' + result[num].afUser?.LAST_NAME,
                };
                const props = ['afUser'];
                result[num] = propsRemover(result[num], ...props);
                result[num] = Object.assign(result[num], name);
            }
            return result;
        } catch (err) {
            console.log(err);
        }
    }
    async updateFrame(userPk: number, departmentPk: number, comPk: number, framePk: number) {
        const result = await await this.createQueryBuilder().select().andWhere('');
    }
}
