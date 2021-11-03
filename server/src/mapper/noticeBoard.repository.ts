import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { NoticeBoard } from '../entity';
import { unixTimeStamp } from 'src/Helpers/functions';
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
    deleteArticle(userPk: number, num: number) {
        try {
            return this.createQueryBuilder()
                .update(NoticeBoard)
                .set({ IS_DELETE: 1 })
                .where('NO like :num', { num: `${num}` })
                .andWhere('USER_PK like :userPk', { userPk: `${userPk}` })
                .execute();
        } catch (err) {
            return err;
        }
    }
    updateArticle(title: string, content: string, userPk: number, num: number) {
        try {
            const time = unixTimeStamp();
            return this.createQueryBuilder()
                .update(NoticeBoard)
                .set({ TITLE: title, CONTENT: content, UPDATE_DATE: time })
                .where('NO like :num', { num: `${num}` })
                .andWhere('USER_PK like :userPk', { userPk: `${userPk}` })
                .execute();
        } catch (err) {
            return err;
        }
    }
    async createBtnSize(option: number, comPk: number) {
        const artcileSize = await this.createQueryBuilder()
            .select()
            .where('COMPANY_PK like :comPk', { comPk: `${comPk}` })
            .getCount();
        const size = Math.ceil(artcileSize / option);
        return size;
    }
    async getList(option: number, comPk: number, pageNum: number) {
        return await this.createQueryBuilder('n')
            .select(['n.NO', 'n.TITLE', 'n.CREATE_DATE', 'n.IS_DELETE', 'n.CREATE_DATE'])
            .limit(option)
            .offset(pageNum)
            .where('COMPANY_PK like :comPk', { comPk: `${comPk}` })
            .getMany();
    }
    async getDetail(num: number, userPk: number) {
        return await this.createQueryBuilder('n')
            .select()
            .where('USER_PK like :userPk', { userPk: `${userPk}` })
            .andWhere('NO like :num', { num: `${num}` })
            .getOne();
    }
}
