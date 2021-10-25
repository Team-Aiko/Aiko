import { EntityRepository, Repository } from 'typeorm';
import { NoticeBoard } from 'src/entity';

@EntityRepository(NoticeBoard)
export default class NoticeBoardRepository extends Repository<NoticeBoard> {
    createArticle(title: string, content: string, userPk: number) {
        try {
            return this.createQueryBuilder()
                .insert()
                .into(NoticeBoard)
                .values({ TITLE: title, CONTENT: content, USER_PK: userPk })
                .execute();
        } catch (err) {
            return err;
        }
    }
}