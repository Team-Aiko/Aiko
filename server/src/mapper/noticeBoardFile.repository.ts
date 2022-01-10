import { EntityManager, EntityRepository, Repository, TransactionManager } from 'typeorm';
import NoticeBoardFile from 'src/entity/noticeBoardFile.entity';
import { AikoError } from 'src/Helpers';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { stackAikoError } from 'src/Helpers/functions';

enum noticeBoardFileError {
    createFiles = 1,
    deleteFiles = 2,
    downloadFile = 3,
}

@EntityRepository(NoticeBoardFile)
export default class NoticeBoardFileRepository extends Repository<NoticeBoardFile> {
    // 파일 저장
    async createFiles(
        files: Express.Multer.File[],
        noticeboardPk: number,
        userPk: number,
        comPk: number,
        @TransactionManager() manager: EntityManager,
    ) {
        try {
            const DTOs = files.map((file) => {
                const originalName = file.originalname;
                const uuid = file.filename;
                return {
                    ORIGINAL_NAME: originalName,
                    UUID: uuid,
                    NOTICE_BOARD_PK: noticeboardPk,
                    USER_PK: userPk,
                    COMPANY_PK: comPk,
                    IS_DELETE: 0,
                };
            });
            await manager.insert(NoticeBoardFile, DTOs);
        } catch (err) {
            throw stackAikoError(
                err,
                'NoticeBoardFileRepository/createFiles',
                500,
                headErrorCode.noticeBoardFileDB + noticeBoardFileError.createFiles,
            );
        }
    }
    async deleteFiles(delFilePks: number[], @TransactionManager() manager: EntityManager) {
        try {
            await manager
                .createQueryBuilder()
                .update(NoticeBoardFile)
                .set({
                    IS_DELETE: 1,
                })
                .where('NBF_PK IN(:...PK)', { PK: delFilePks })
                .execute();
        } catch (err) {
            throw stackAikoError(
                err,
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
