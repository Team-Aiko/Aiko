import { EntityRepository, Repository } from 'typeorm';
import { NoticeBoard } from '../entity';
@EntityRepository(NoticeBoard)
export default class NoticeBoardRepository extends Repository<NoticeBoard> {
    createArticle(title: string, content: string, userPk: number, comPk: number) {
        try {
            return this.createQueryBuilder()
                .insert()
                .into(NoticeBoard)
                .values({ TITLE: title, CONTENT: content, USER_PK: userPk, COMPANY_PK: comPk, IS_DELETE: 0 })
                .execute();
        } catch (err) {
            return err;
        }
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
        console.log(title, content, userPk, num);
        try {
            return this.createQueryBuilder()
                .update(NoticeBoard)
                .set({ TITLE: title, CONTENT: content })
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
    // getList(){

    // }
}