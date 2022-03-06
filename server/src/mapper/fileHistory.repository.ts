import { FileHistory } from 'src/entity';
import { AikoError } from 'src/Helpers';
import { stackAikoError, unixTimeStamp } from 'src/Helpers/functions';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { EntityRepository, Repository, TransactionManager, EntityManager, Brackets } from 'typeorm';

enum fileHistoryError {
    createFileHistory = 1,
    downloadDriveFiles = 2,
    deletedFlagFiles = 3,
    updateHistory = 4,
    getFileHistory = 5,
}

@EntityRepository(FileHistory)
export default class FileHistoryRepository extends Repository<FileHistory> {
    async createFileHistory(
        files: Omit<FileHistory, 'FH_PK' | 'fileKey' | 'user'>[],
        @TransactionManager() manager?: EntityManager,
    ) {
        try {
            if (manager) {
                return (await manager.insert(FileHistory, files)).identifiers as Pick<FileHistory, 'FH_PK'>[];
            } else {
                return (await this.insert(files)).identifiers as Pick<FileHistory, 'FH_PK'>[];
            }
        } catch (err) {
            throw stackAikoError(
                err,
                'FileHistoryRepository/createFileHistory',
                500,
                headErrorCode.fileHistoryDB + fileHistoryError.createFileHistory,
            );
        }
    }

    async downloadDriveFiles(fileId: number) {
        try {
            const result = await this.createQueryBuilder()
                .where(`FILE_KEY_PK = ${fileId}`)
                .orderBy('FH_PK', 'DESC')
                .getMany();

            console.log(
                '🚀 ~ file: fileHistory.repository.ts ~ line 31 ~ FileHistoryRepository ~ downloadDriveFiles ~ result',
                result,
            );
            return result.length ? result[0] : undefined;
        } catch (err) {
            throw stackAikoError(
                err,
                'FileHistoryRepository/downloadDriveFiles',
                500,
                headErrorCode.fileHistoryDB + fileHistoryError.downloadDriveFiles,
            );
        }
    }

    async deletedFlagFiles(files: number[], @TransactionManager() manager: EntityManager) {
        try {
            await manager
                .createQueryBuilder()
                .delete()
                .from(FileHistory)
                .where('FILE_KEY_PK IN(:...files)', { files })
                .execute();
        } catch (err) {
            throw stackAikoError(
                err,
                'FileHistoryRepository/deletedFlagFiles',
                500,
                headErrorCode.fileHistoryDB + fileHistoryError.deletedFlagFiles,
            );
        }
    }

    async updateHistory(
        folderPK: number,
        fileKeyPK: number,
        file: Express.Multer.File,
        companyPK: number,
        userPK: number,
    ) {
        try {
            const currentTime = unixTimeStamp();
            const dto: Partial<FileHistory> = {
                DATE: currentTime,
                FILE_KEY_PK: fileKeyPK,
                ORIGINAL_FILE_NAME: file.originalname,
                USER_PK: userPK,
                NAME: file.filename,
                SIZE: file.size,
            };

            await this.insert(dto);
        } catch (err) {
            throw stackAikoError(
                err,
                'FileHistoryRepository/updateHistory',
                500,
                headErrorCode.fileHistoryDB + fileHistoryError.updateHistory,
            );
        }
    }

    async getFileHistory(fileKey: number, companyPK: number) {
        try {
            return await this.createQueryBuilder('history')
                .innerJoinAndSelect('history.fileKey', 'fileKey')
                .where(`fileKey.FILE_KEY_PK = ${fileKey}`)
                .andWhere(`fileKey.COMPANY_PK = ${companyPK}`)
                .andWhere('fileKey.IS_DELETED = 0')
                .getMany();

            // (qb) =>
            // qb
            //     .where(`FILE_KEY_PK = ${fileKey}`)
            //     .andWhere(`COMPANY_PK = ${companyPK}`)
            //     .andWhere('IS_DELETED = 0'),
            // 'history.file',
        } catch (err) {
            throw stackAikoError(
                err,
                'FileHistoryRepository/getFileHistory',
                500,
                headErrorCode.fileHistoryDB + fileHistoryError.getFileHistory,
            );
        }
    }
}
