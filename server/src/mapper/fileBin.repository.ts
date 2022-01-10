import FileBin from 'src/entity/fileBin.entity';
import { AikoError, unixTimeStamp } from 'src/Helpers';
import { stackAikoError } from 'src/Helpers/functions';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { EntityRepository, Repository, TransactionManager, EntityManager } from 'typeorm';

enum fileBinError {
    deleteFiles = 1,
    getDeleteFlagFiles = 2,
    deleteFilesForScheduler = 3,
}

@EntityRepository(FileBin)
export default class FileBinRepository extends Repository<FileBin> {
    async deleteFiles(
        filePKs: number | number[],
        USER_PK: number,
        COMPANY_PK: number,
        @TransactionManager() manager: EntityManager,
    ) {
        try {
            const isArray = Array.isArray(filePKs);
            const DATE = unixTimeStamp();
            let fileBinList: Pick<FileBin, 'FILE_KEY_PK' | 'DATE' | 'USER_PK' | 'COMPANY_PK'>[] = [];

            if (isArray) fileBinList = filePKs.map((FILE_KEY_PK) => ({ FILE_KEY_PK, DATE, USER_PK, COMPANY_PK }));
            else fileBinList.push({ FILE_KEY_PK: filePKs, DATE, USER_PK, COMPANY_PK });
            console.log(
                '🚀 ~ file: fileBin.repository.ts ~ line 24 ~ FileBinRepository ~ deleteFiles ~ fileBinList',
                fileBinList,
            );

            await manager.save(FileBin, fileBinList);
        } catch (err) {
            throw stackAikoError(
                err,
                'FileBinRepository/deleteFiles',
                500,
                headErrorCode.fileBinDB + fileBinError.deleteFiles,
            );
        }
    }

    async getDeleteFlagFiles(limitTime: number) {
        try {
            return await this.createQueryBuilder().where(`DATE <= ${limitTime}`).getMany();
        } catch (err) {
            throw stackAikoError(
                err,
                'FileBinRepository/getDeleteFlagFiles',
                500,
                headErrorCode.fileBinDB + fileBinError.getDeleteFlagFiles,
            );
        }
    }

    async deleteFilesForScheduler(files: number[], @TransactionManager() manager: EntityManager) {
        try {
            await manager
                .createQueryBuilder()
                .delete()
                .from(FileBin)
                .where('FILE_KEY_PK IN(:...files)', { files })
                .execute();
        } catch (err) {
            throw stackAikoError(
                err,
                'FileBinRepository/deleteFilesForScheduler',
                500,
                headErrorCode.fileBinDB + fileBinError.deleteFilesForScheduler,
            );
        }
    }
}
