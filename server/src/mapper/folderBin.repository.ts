import { FolderBin } from 'src/entity';
import { AikoError, unixTimeStamp } from 'src/Helpers';
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

@EntityRepository(FolderBin)
export default class FolderBinRepository extends Repository<FolderBin> {
    async deleteFolder(
        FOLDER_PK: number,
        COMPANY_PK: number,
        USER_PK: number,
        @TransactionManager() manager: EntityManager,
    ) {
        try {
            const DATE = unixTimeStamp();

            return (await manager.insert(FolderBin, { FOLDER_PK, COMPANY_PK, USER_PK, DATE })).identifiers as Pick<
                FolderBin,
                'FOLDER_BIN_PK'
            >[];
        } catch (err) {
            console.error(err);
            throw new AikoError('FolderBinRepository/deleteFolder', 500, 819284);
        }
    }
}
