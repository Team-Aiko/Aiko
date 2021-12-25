import { EntityRepository, Repository } from 'typeorm';
import NoticeBoardFile from 'src/entity/noticeBoardFile.entity';
import { AikoError } from 'src/Helpers';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';

enum noticeBoardFileError {
    createFiles = 1,
    deleteFiles = 2,
    downloadFile = 3,
}

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
            throw new AikoError(
                'NoticeBoardFileRepository/createFiles',
                500,
                headErrorCode.noticeBoardFileDB + noticeBoardFileError.createFiles,
            );
        }
    }
    async deleteFiles(delFilePks: number[]) {
        try {
            for (const pk of delFilePks) {
                await this.createQueryBuilder()
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
            throw new AikoError(
                'NoticeBoardFileRepository/createFiles',
                500,
                headErrorCode.noticeBoardFileDB + noticeBoardFileError.deleteFiles,
            );
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
