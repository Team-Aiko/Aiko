import FileKeys from 'src/entity/fileKeys.entity';
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

@EntityRepository(FileKeys)
export default class FileKeysRepository extends Repository<FileKeys> {
    async createFileKeys(count: number, FOLDER_PK: number, @TransactionManager() manager: EntityManager) {
        console.log('🚀 ~ file: fileKeys.repository.ts ~ line 17 ~ FileKeysRepository ~ createFileKeys ~ count', count);

        try {
            const list: Pick<FileKeys, 'FOLDER_PK'>[] = [];

            for (let i = 0; i < count; i++) {
                list.push({ FOLDER_PK });
            }
            const insertedResult = await manager.insert(FileKeys, list);

            return insertedResult.identifiers as Pick<FileKeys, 'FILE_KEY_PK'>[];
        } catch (err) {
            console.error(err);
            throw new AikoError('FileKeysRepository/createFileKeys', 500, 292102);
        }
    }
}
