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
import FileKeysRepository from './fileKeys.repository';
import FolderBinRepository from './folderBin.repository';

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
        console.log(
            '🚀 ~ file: fileFolder.repository.ts ~ line 48 ~ FileFolderRepository ~ getFolderInfo ~ folderPKs',
            folderPKs,
        );
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

    async getAllChildren(folderPKs: number | number[], companyPK: number) {
        try {
            const isArray = Array.isArray(folderPKs);
            let result: FileFolder[] = [];

            if (isArray) {
                await Promise.all(
                    folderPKs.map(async (folderPK) => {
                        result = result.concat((await getManager().query(getSQL(folderPK, companyPK))) as FileFolder[]);
                    }),
                );
            } else {
                result = (await getManager().query(getSQL(folderPKs, companyPK))) as FileFolder[];
            }

            return result;

            function getSQL(folderPK: number, companyPK: number) {
                const sql = `with recursive GET_ALL_CHILDREN as (
                    select 
                        *
                    from FILE_FOLDER_TABLE
                    where FOLDER_PK = ${folderPK} and COMPANY_PK = ${companyPK} and IS_DELETED = 0
                    union
                    select
                        FF1.*
                    from
                        FILE_FOLDER_TABLE as FF1, FILE_FOLDER_TABLE as FF2
                    where
                        FF1.PARENT_PK = FF2.FOLDER_PK
                 ) select * from GET_ALL_CHILDREN`;

                return sql;
            }
        } catch (err) {
            console.error(err);
            throw new AikoError('FileFolderRepository/getAllChildren', 500, 192924);
        }
    }

    async deleteFolderAndFiles(
        folderPKs: number | number[],
        companyPK: number,
        userPK: number,
        @TransactionManager() manager: EntityManager,
    ) {
        try {
            // get folder PK list
            const isArray = Array.isArray(folderPKs);
            if (isArray) await deleteProcess(folderPKs, this);
            else await deleteProcess([folderPKs], this);

            async function deleteProcess(folders: number[], obj: FileFolderRepository) {
                // delete folders
                if (folders.length > 0) {
                    const validFolders = await getRepo(FolderBinRepository).deleteFolder(
                        folders,
                        companyPK,
                        userPK,
                        manager,
                    );
                    await obj.updateDeleteFlag(validFolders, manager);
                    let filePKs: number[] = [];

                    Promise.all(
                        validFolders.map(async (folderPK) => {
                            const result = await getRepo(FileKeysRepository).selectFilesInFolder(folderPK);
                            filePKs = filePKs.concat(result.map((file) => file.FILE_KEY_PK));
                        }),
                    );

                    await getRepo(FileKeysRepository).deleteFiles(filePKs, companyPK, manager);
                }
            }
        } catch (err) {
            console.error(err);
            throw new AikoError('FileFolderRepository/deleteFolderAndFiles', 500, 192921);
        }
    }

    async updateDeleteFlag(folders: number | number[], @TransactionManager() manager: EntityManager) {
        try {
            const isArray = Array.isArray(folders);
            const whereCondition = `FOLDER_PK ${isArray ? 'IN (:...folders)' : '= :folders'}`;
            await manager
                .createQueryBuilder()
                .update(FileFolder)
                .set({ IS_DELETED: 1 })
                .where(whereCondition, { folders })
                .execute();
        } catch (err) {
            throw err;
        }
    }

    async checkValidDeleteFolder(folderPKs: number | number[]) {
        try {
            const isArray = Array.isArray(folderPKs);
            const whereCondition = `FOLDER_PK ${isArray ? 'IN(:...folderPKs)' : '= :folderPKs'}`;
            const fraction = this.createQueryBuilder().where(whereCondition, { folderPKs }).andWhere('IS_DELETED = 0');

            return isArray ? await fraction.getMany() : await fraction.getOne();
        } catch (err) {
            console.error(err);
            throw new AikoError('FolderBinRepository/checkValidDeleteFolder', 500, 129281);
        }
    }
}
