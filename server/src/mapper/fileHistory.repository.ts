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
}
