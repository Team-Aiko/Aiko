import { FileHistory } from 'src/entity';
import { AikoError } from 'src/Helpers';
import {
    EntityRepository,
    getConnection,
    InsertResult,
    Repository,
    getManager,
    TransactionManager,
    EntityManager,
    Transaction,
} from 'typeorm';

@EntityRepository(FileHistory)
export default class FileHistoryRepository extends Repository<FileHistory> {
    async createFileHistory(
        files: Omit<FileHistory, 'FH_PK' | 'fileKey' | 'user'>[],
        @TransactionManager() manager: EntityManager,
    ) {
        try {
            return (await manager.insert(FileHistory, files)).identifiers as Pick<FileHistory, 'FH_PK'>[];
        } catch (err) {
            console.error(err);
            throw new AikoError('FileHistoryRepository/createFileHistory', 500, 192845);
        }
    }

    async downloadDriveFiles(fileId: number) {
        try {
            console.log('여기오는거지??? 와라 제발 시발럼아');
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
            console.error(err);
            throw new AikoError('FileHistoryRepository/downloadDriveFiles', 500, 829182);
        }
    }
}
