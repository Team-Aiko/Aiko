import { createQueryBuilder, EntityRepository, Repository } from 'typeorm';
import NoticeBoardFile from 'src/entity/noticeBoardFile.entity';
import { unixTimeStamp } from 'src/Helpers/functions';

@EntityRepository(NoticeBoardFile)
export default class NoticeBoardFileRepository extends Repository<NoticeBoardFile> {
    async createFiles(files, noticeboardPk: number, userPk: number) {
        try {
            for (const i in files) {
                const originalName = await files[i].originalname;
                const uuid = await files[i].filename;
                await this.createQueryBuilder()
                    .insert()
                    .into(NoticeBoardFile)
                    .values({
                        ORIGINAL_NAME: originalName,
                        UUID: uuid,
                        NOTICE_BOARD_PK: noticeboardPk,
                        USER_PK: userPk,
                        IS_DELETE: 0,
                    })
                    .execute();
            }
        } catch (err) {
            console.log(err);
        }
    }
}
