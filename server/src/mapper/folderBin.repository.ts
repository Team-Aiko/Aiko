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
        folderPKs: number | number[],
        COMPANY_PK: number,
        USER_PK: number,
        @TransactionManager() manager: EntityManager,
    ) {
        try {
            const DATE = unixTimeStamp();
            let DTOs: { USER_PK: number; COMPANY_PK: number; FOLDER_PK: number; DATE: number }[] = [];
            const isArray = Array.isArray(folderPKs);

            if (isArray) DTOs = folderPKs.map((folderPK) => ({ USER_PK, COMPANY_PK, FOLDER_PK: folderPK, DATE }));
            else DTOs.push({ USER_PK, COMPANY_PK, FOLDER_PK: folderPKs, DATE });

            await manager.save(FolderBin, DTOs);
        } catch (err) {
            console.error(err);
            throw new AikoError('FolderBinRepository/deleteFolder', 500, 819284);
        }
    }
}
