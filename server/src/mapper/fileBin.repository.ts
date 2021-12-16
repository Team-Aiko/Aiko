import FileBin from 'src/entity/fileBin.entity';
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
            console.error(err);
            throw new AikoError('FileBinRepository/deleteFiles', 500, 9192384);
        }
    }

    async getDeleteFlagFiles(limitTime: number) {
        try {
            return await this.createQueryBuilder().where(`DATE <= ${limitTime}`).getMany();
        } catch (err) {
            console.error(err);
            throw new AikoError('FileBinRepository/getDeleteFlagFiles', 500, 9192384);
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
            console.error(err);
            throw new AikoError('FileBinRepository/deleteFilesForScheduler', 500, 9192384);
        }
    }
}
