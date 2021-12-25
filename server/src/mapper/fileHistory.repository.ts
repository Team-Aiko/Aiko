import { FileHistory } from 'src/entity';
import { AikoError } from 'src/Helpers';
import { stackAikoError } from 'src/Helpers/functions';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { EntityRepository, Repository, TransactionManager, EntityManager } from 'typeorm';

enum fileHistoryError {
    createFileHistory = 1,
    downloadDriveFiles = 2,
    deletedFlagFiles = 3,
}

@EntityRepository(FileHistory)
export default class FileHistoryRepository extends Repository<FileHistory> {
    async createFileHistory(
        files: Omit<FileHistory, 'FH_PK' | 'fileKey' | 'user'>[],
        @TransactionManager() manager: EntityManager,
    ) {
        try {
            return (await manager.insert(FileHistory, files)).identifiers as Pick<FileHistory, 'FH_PK'>[];
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
}
