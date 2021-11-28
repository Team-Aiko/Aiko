import { createQueryBuilder, EntityRepository, Repository } from 'typeorm';
import NoticeBoardFile from 'src/entity/noticeBoardFile.entity';
import { unixTimeStamp } from 'src/Helpers/functions';

@EntityRepository(NoticeBoardFile)
export default class NoticeBoardFileRepository extends Repository<NoticeBoardFile> {
    // 파일 저장
    async createFiles(files: Express.Multer.File[], noticeboardPk: number, userPk: number, comPk: number) {
        try {
            console.log(noticeboardPk);
            for (const file of files) {
                const originalName = file.originalname;
                const uuid = file.filename;
                await this.createQueryBuilder()
                    .insert()
                    .into(NoticeBoardFile)
                    .values({
                        ORIGINAL_NAME: originalName,
                        UUID: uuid,
                        NOTICE_BOARD_PK: noticeboardPk,
                        USER_PK: userPk,
                        COMPANY_PK: comPk,
                        IS_DELETE: 0,
                    })
                    .execute();
            }
        } catch (err) {
            console.log(err);
        }
    }
    async deleteFiles(delFilePks: number[]) {
        try {
            for (const pk in delFilePks) {
                console.log(pk);
                return await this.createQueryBuilder()
                    .update(NoticeBoardFile)
                    .set({
                        IS_DELETE: 1,
                    })
                    .where('NBF_PK = :pk', { pk: `${pk}` })
                    // .andWhere('comPK = :comPk', { comPk: `${comPk}`})
                    .execute();
            }
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    // 게시글 삭제

    async downloadFile(fileId: number, comPk: number) {
        const result = await this.createQueryBuilder('n')
            .select(['n.UUID', 'n.ORIGINAL_NAME'])
            .where('NBF_PK = :fileId', { fileId: `${fileId}` })
            .andWhere('COMPANY_PK = :comPk', { comPk: `${comPk}` })
            .andWhere('IS_DELETE = 0')
            .getOne();
        return result;
    }
}
