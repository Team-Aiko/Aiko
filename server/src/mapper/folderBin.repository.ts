import { FileBin, FolderBin } from 'src/entity';
import { AikoError, getRepo, unixTimeStamp } from 'src/Helpers';
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
import FileFolderRepository from './fileFolder.repository';

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
            const DTOs = await getRepo(FileFolderRepository).checkValidDeleteFolder(folderPKs);
            const isArray = Array.isArray(DTOs);
            const returnVal = isArray ? DTOs.map((dto) => dto.FOLDER_PK) : [DTOs.FOLDER_PK];

            if (isArray)
                await manager.save(
                    FolderBin,
                    DTOs.map((dto) => ({ FOLDER_PK: dto.FOLDER_PK, DATE, USER_PK, COMPANY_PK })),
                );
            else {
                if (!DTOs) return;
                await manager.save(FolderBin, { FOLDER_PK: DTOs.FOLDER_PK, DATE, USER_PK, COMPANY_PK });
            }

            return returnVal;
        } catch (err) {
            console.error(err);
            throw new AikoError('FolderBinRepository/deleteFolder', 500, 819284);
        }
    }
}
