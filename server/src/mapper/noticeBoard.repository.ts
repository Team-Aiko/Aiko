import { EntityRepository, InsertResult, Repository, TransactionManager, EntityManager } from 'typeorm';
import { NoticeBoard } from '../entity';
import { unixTimeStamp, propsRemover } from 'src/Helpers/functions';
@EntityRepository(NoticeBoard)
export default class NoticeBoardRepository extends Repository<NoticeBoard> {
    async createArticle(title: string, content: string, userPk: number, comPk: number) {
        let insertResult: InsertResult;
        try {
            const time = unixTimeStamp();
            insertResult = await this.createQueryBuilder()
                .insert()
                .into(NoticeBoard)
                .values({
                    TITLE: title,
                    CONTENT: content,
                    USER_PK: userPk,
                    UPDATE_USER_PK: userPk,
                    UPDATE_DATE: time,
                    COMPANY_PK: comPk,
                    IS_DELETE: 0,
                    CREATE_DATE: time,
                })
                .execute();
        } catch (err) {
            return err;
        }
        return insertResult.raw.insertId;
    }
    async deleteArticle(userPk: number, num: number) {
        try {
            return await this.createQueryBuilder()
                .update(NoticeBoard)
                .set({ IS_DELETE: 1 })
                .where('NOTICE_BOARD_PK like :num', { num: `${num}` })
                .andWhere('USER_PK like :userPk', { userPk: `${userPk}` })
                .execute();
        } catch (err) {
            return err;
        }
    }
    async updateArticle(title: string, content: string, userPk: number, num: number) {
        try {
            const time = unixTimeStamp();
            return await this.createQueryBuilder()
                .update(NoticeBoard)
                .set({ TITLE: title, CONTENT: content, UPDATE_DATE: time, UPDATE_USER_PK: userPk })
                .where('NOTICE_BOARD_PK like :num', { num: `${num}` })
                // .andWhere('USER_PK like :userPk', { userPk: `${userPk}` })
                .andWhere('IS_DELETE = 0')
                .execute();
        } catch (err) {
            return err;
        }
    }
    async createBtnSize(option: number, comPk: number) {
        const artcileSize = await this.createQueryBuilder()
            .select()
            .where('COMPANY_PK like :comPk', { comPk: `${comPk}` })
            .andWhere('IS_DELETE = 0')
            .getCount();
        const size = Math.ceil(artcileSize / option);
        return size;
    }
    async getList(option: number, comPk: number, pageNum: number) {
        try {
            const result = await this.createQueryBuilder('n')
                .select(['n.NOTICE_BOARD_PK', 'n.TITLE', 'n.CREATE_DATE', 'n.IS_DELETE', 'n.CREATE_DATE'])
                .leftJoinAndSelect('n.user', 'user')
                .leftJoinAndSelect('n.updateUser', 'updateUser')
                .limit(option)
                .offset(pageNum)
                .where('n.COMPANY_PK like :comPk', { comPk: `${comPk}` })
                .andWhere('n.IS_DELETE = 0')
                .getMany();
            for (const num in result) {
                const name = {
                    USER_NAME: result[num].user?.FIRST_NAME + ' ' + result[num].user?.LAST_NAME,
                    UPDATE_USER_NAME: result[num].updateUser?.FIRST_NAME + ' ' + result[num].updateUser?.LAST_NAME,
                };
                const props = ['user', 'updateUser'];
                result[num] = propsRemover(result[num], ...props);
                result[num] = Object.assign(result[num], name);
            }
            return result;
        } catch (err) {
            console.log(err);
        }
    }
    async getDetail(num: number, comPk: number) {
        let result = await this.createQueryBuilder('nb')
            .leftJoinAndSelect('nb.files', 'files')
            .leftJoinAndSelect('nb.user', 'user')
            .where('nb.COMPANY_PK = :comPk', { comPk: `${comPk}` })
            .andWhere('nb.NOTICE_BOARD_PK = :num', { num: `${num}` })
            .andWhere('nb.IS_DELETE = 0')
            .getOne();
        const name = {
            USER_NAME: result.user.FIRST_NAME + ' ' + result.user.LAST_NAME,
        };
        result = propsRemover(result, 'user');
        result = Object.assign(result, name);
        return result;
    }
}
