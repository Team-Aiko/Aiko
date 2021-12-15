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

            if (isArray)
                await manager.save(
                    FolderBin,
                    DTOs.map((dto) => ({ FOLDER_PK: dto.FOLDER_PK, DATE, USER_PK, COMPANY_PK })),
                );
            else {
                if (!DTOs) return;
                await manager.save(FolderBin, { FOLDER_PK: DTOs.FOLDER_PK, DATE, USER_PK, COMPANY_PK });
            }
            // let DTOs: { USER_PK: number; COMPANY_PK: number; FOLDER_PK: number; DATE: number }[] = [];
            // const isArray = Array.isArray(folderPKs);

            // if (isArray) DTOs = folderPKs.map((folderPK) => ({ USER_PK, COMPANY_PK, FOLDER_PK: folderPK, DATE }));
            // else DTOs.push({ USER_PK, COMPANY_PK, FOLDER_PK: folderPKs, DATE });

            // await manager.save(FolderBin, DTOs);
        } catch (err) {
            console.error(err);
            throw new AikoError('FolderBinRepository/deleteFolder', 500, 819284);
        }
    }
}
