import { FileFolder } from 'src/entity';
import { AikoError, getRepo } from 'src/Helpers';
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
import FileHistoryRepository from './fileHistory.repository';

@EntityRepository(FileFolder)
export default class FileFolderRepository extends Repository<FileFolder> {
    async createFolder(
        COMPANY_PK: number,
        FOLDER_NAME: string,
        PARENT_PK: number | undefined,
        @TransactionManager() manager?: EntityManager,
    ) {
        try {
            let insertedResult: InsertResult;

            if (manager) {
                // root folder case
                insertedResult = await manager.insert(FileFolder, { COMPANY_PK, FOLDER_NAME, PARENT_PK });
            } else {
                // sub folder case
                insertedResult = await this.createQueryBuilder()
                    .insert()
                    .into(FileFolder)
                    .values({ COMPANY_PK, FOLDER_NAME, PARENT_PK })
                    .execute();
                //
            }

            return insertedResult.identifiers as Pick<FileFolder, 'FOLDER_PK'>[];
        } catch (err) {
            console.error(err);
            throw new AikoError('FileFolderRepository/createFolder', 500, 590211);
        }
    }

    async getFolderInfo(folderPKs: number | number[]) {
        try {
            const isArray = Array.isArray(folderPKs);
            const whereCondition = `FOLDER_PK ${isArray ? 'IN (...:folderPKs)' : '= :folderPKs'}`;
            let result: FileFolder[] | FileFolder;

            const fraction = this.createQueryBuilder().where(whereCondition, { folderPKs });
            if (isArray) result = await fraction.getMany();
            else result = await fraction.getOneOrFail();

            return result;
        } catch (err) {
            console.error(err);
            throw new AikoError('FileFolderRepository/createFolder', 500, 192894);
        }
    }

    async getAllChildren(folderPK: number, companyPK: number) {
        try {
            const sql = `with recursive GET_ALL_CHILDREN as (
                select 
                    *
                from FILE_FOLDER_TABLE
                where FOLDER_PK = ${folderPK} and COMPANY_PK = ${companyPK}
                union all
                select
                    FF1.*
                from
                    FILE_FOLDER_TABLE FF1, FILE_FOLDER_TABLE FF2
                where
                    FF1.PARENT_PK = FF2.FOLDER_PK
             ) select * from GET_ALL_CHILDREN`;

            const result = (await getManager().query(sql)) as FileFolder[];
            return result;
        } catch (err) {
            console.error(err);
            throw new AikoError('FileFolderRepository/getAllChildren', 500, 192924);
        }
    }

    async deleteFolderAndFiles(
        folderPKs: number | number[],
        companyPK: number,
        @TransactionManager() manager: EntityManager,
    ) {
        try {
            // get folder PK list
            let folders: number[] = [];
            const isArray = Array.isArray(folderPKs);
            if (isArray) {
                folderPKs.forEach(async (folderPK) => {
                    const children = await this.getAllChildren(folderPK, companyPK);
                    children.forEach((child) => folders.push(child.FOLDER_PK));
                });

                folders = folders.concat(folderPKs);
            } else {
                const children = await this.getAllChildren(folderPKs, companyPK);
                children.forEach((child) => folders.push(child.FOLDER_PK));
                folders.push(folderPKs);
            }
        } catch (err) {
            console.error(err);
            throw new AikoError('FileFolderRepository/deleteFolderAndFiles', 500, 192921);
        }
    }
}
