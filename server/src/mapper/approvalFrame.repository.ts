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
    async generateList(pks: number[]) {
        const result = await this.createQueryBuilder('n').select(['n.TITLE', 'n.CONTENT']).whereInIds(pks).getMany();
        return result;
    }
    async doneList(comPk: number, departmentPk: number) {
        try {
            const result = await this.createQueryBuilder()
                .select()
                .andWhere('COMPANY_PK =:comPk', { comPk: `${comPk}` })
                .andWhere('DEPARTMENT_PK =:departmentPk', { departmentPk: `${departmentPk}` })
                .andWhere('END_DATE is not null')
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
    async detailFrame(userPk: number, departmentPk: number, comPk: number, framePk: number) {
        const result = await await this.createQueryBuilder().select(['']).andWhere('');
    }
    // async needToDoList(infos: any) {
    //     try {
    //         for (const info of infos) {
    //             console.log(info);
    //         }
    //         // const result = await this.createQueryBuilder('as')
    //         //     .select(['as.AF_PK', 'as.STEP_LEVEL'])
    //         //     // .where('USER_PK =:userPk', { userPk: `${userPk}` })
    //         //     .orWhere('END_DATE is not null')
    //         //     .getMany();
    //         // return result;
    //     } catch (err) {
    //         console.log(err);
    //     }
    //     // result = propsRemover(result, 'user');
    //     // result = Object.assign(result, name);
    // }
}

/* .select()
            .andWhere('COMPANY_PK =:comPk', { comPk: `${comPk}` })
            .andWhere('DEPARTMENT_PK =:departmentPk', { departmentPk: `${departmentPk}` })
            .orWhere('USER_PK =:userPk', { userPk: `${userPk}` })
            .orWhere('END_DATE is not null')
            .getMany();
*/
