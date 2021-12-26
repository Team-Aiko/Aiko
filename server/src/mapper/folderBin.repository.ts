import { FileBin, FolderBin } from 'src/entity';
import { AikoError, getRepo, unixTimeStamp } from 'src/Helpers';
import { stackAikoError } from 'src/Helpers/functions';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { EntityRepository, Repository, TransactionManager, EntityManager } from 'typeorm';
import FileFolderRepository from './fileFolder.repository';

enum folderBinError {
    deleteFolder = 1,
    deleteFolderForScheduler = 2,
    getDeleteFlagFolder = 3,
}

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
            throw stackAikoError(
                err,
                'FolderBinRepository/deleteFolder',
                500,
                headErrorCode.folderBinDB + folderBinError.deleteFolder,
            );
        }
    }

    async deleteFolderForScheduler(folders: number[], @TransactionManager() manager: EntityManager) {
        try {
            await manager
                .createQueryBuilder()
                .delete()
                .from(FolderBin)
                .where('FOLDER_PK IN(:...folders)', { folders })
                .execute();
        } catch (err) {
            throw stackAikoError(
                err,
                'FolderBinRepository/deleteFolderForScheduler',
                500,
                headErrorCode.folderBinDB + folderBinError.deleteFolderForScheduler,
            );
        }
    }

    async getDeleteFlagFolder(limitTime: number) {
        try {
            return await this.createQueryBuilder().where(`DATE <= ${limitTime}`).getMany();
        } catch (err) {
            throw stackAikoError(
                err,
                'FolderBinRepository/getDeleteFlagFolder',
                500,
                headErrorCode.folderBinDB + folderBinError.getDeleteFlagFolder,
            );
        }
    }
}
