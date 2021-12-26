import { FileFolder } from 'src/entity';
import { AikoError, getRepo } from 'src/Helpers';
import { stackAikoError } from 'src/Helpers/functions';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { EntityRepository, InsertResult, Repository, getManager, TransactionManager, EntityManager } from 'typeorm';
import FileKeysRepository from './fileKeys.repository';
import FolderBinRepository from './folderBin.repository';

enum fileFolderError {
    createFolder = 1,
    getFolderInfo = 2,
    getAllChildrenWithMyself = 3,
    updateFileSize = 4,
    getAllParentWithMyself = 5,
    moveFolder = 6,
    deleteFolderForScheduler = 7,
    deleteFolderAndFiles = 8,
    updateDeleteFlag = 9,
    checkValidDeleteFolder = 10,
    getDirectChildren = 11,
}

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
            throw stackAikoError(
                err,
                'FileFolderRepository/createFolder',
                500,
                headErrorCode.fileFolderDB + fileFolderError.createFolder,
            );
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
            throw stackAikoError(
                err,
                'FileFolderRepository/createFolder',
                500,
                headErrorCode.fileFolderDB + fileFolderError.getFolderInfo,
            );
        }
    }

    /**
     * folderPKs가 array로 들어갈 시 모든 본인 자식 폴더 리스트를 다 합쳐서 반환
     *
     */
    async getAllChildrenWithMyself(folderPKs: number | number[], companyPK: number) {
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
                    union all
                    select
                        FF1.*
                    from
                        FILE_FOLDER_TABLE as FF1, GET_ALL_CHILDREN as FF2
                    where
                        FF1.PARENT_PK = FF2.FOLDER_PK
                 ) select * from GET_ALL_CHILDREN`;

                return sql;
            }
        } catch (err) {
            throw stackAikoError(
                err,
                'FileFolderRepository/getAllChildrenWithMyself',
                500,
                headErrorCode.fileFolderDB + fileFolderError.getAllChildrenWithMyself,
            );
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
            throw stackAikoError(
                err,
                'FileFolderRepository/deleteFolderAndFiles',
                500,
                headErrorCode.fileFolderDB + fileFolderError.deleteFolderAndFiles,
            );
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
            throw stackAikoError(
                err,
                'FileFolderRepository/updateDeleteFlag',
                500,
                headErrorCode.fileFolderDB + fileFolderError.updateDeleteFlag,
            );
        }
    }

    async checkValidDeleteFolder(folderPKs: number | number[]) {
        try {
            const isArray = Array.isArray(folderPKs);
            const whereCondition = `FOLDER_PK ${isArray ? 'IN(:...folderPKs)' : '= :folderPKs'}`;
            const fraction = this.createQueryBuilder().where(whereCondition, { folderPKs }).andWhere('IS_DELETED = 0');

            return isArray ? await fraction.getMany() : await fraction.getOne();
        } catch (err) {
            throw stackAikoError(
                err,
                'FileFolderRepository/checkValidDeleteFolder',
                500,
                headErrorCode.fileFolderDB + fileFolderError.checkValidDeleteFolder,
            );
        }
    }

    async getDirectChildren(FOLDER_PK: number, COMPANY_PK: number) {
        try {
            return await this.find({ PARENT_PK: FOLDER_PK, COMPANY_PK });
        } catch (err) {
            throw stackAikoError(
                err,
                'FileFolderRepository/getDirectChildren',
                500,
                headErrorCode.fileFolderDB + fileFolderError.getDirectChildren,
            );
        }
    }

    async updateFileSize(
        FOLDER_PK: number,
        COMPANY_PK: number,
        fileSize: number,
        @TransactionManager() manager: EntityManager,
    ) {
        try {
            const folderList = await this.getAllParentWithMyself(FOLDER_PK, COMPANY_PK);
            await Promise.all(
                folderList.map(async (folder) => {
                    folder.SIZE += fileSize;
                    await manager.update(FileFolder, { FOLDER_PK: folder.FOLDER_PK }, { SIZE: folder.SIZE });
                }),
            );
        } catch (err) {
            throw stackAikoError(
                err,
                'FileFolderRepository/updateFileSize',
                500,
                headErrorCode.fileFolderDB + fileFolderError.updateFileSize,
            );
        }
    }

    async getAllParentWithMyself(FOLDER_PK: number, COMPANY_PK: number) {
        try {
            return (await getManager().query(`with recursive GET_ALL_PARENT as (
                select
                    *
                from FILE_FOLDER_TABLE
                where FOLDER_PK = ${FOLDER_PK} and COMPANY_PK = ${COMPANY_PK} and IS_DELETED = 0
                union
                select
                    FF1.*
                from
                    FILE_FOLDER_TABLE as FF1, GET_ALL_PARENT as FF2
                where
                    FF1.FOLDER_PK = FF2.PARENT_PK
             ) select * from GET_ALL_PARENT`)) as FileFolder[];
        } catch (err) {
            throw stackAikoError(
                err,
                'FileFolderRepository/getAllParentWithMyself',
                500,
                headErrorCode.fileFolderDB + fileFolderError.getAllParentWithMyself,
            );
        }
    }

    async moveFolder(toFolderPK: number, fromFolderPKs: number[], @TransactionManager() manager: EntityManager) {
        try {
            await manager
                .createQueryBuilder()
                .update(FileFolder)
                .set({ FOLDER_PK: toFolderPK })
                .where('FOLDER_PK IN(...:fromFolderPKs)', { fromFolderPKs })
                .execute();
        } catch (err) {
            throw stackAikoError(
                err,
                'FileFolderRepository/moveFolder',
                500,
                headErrorCode.fileFolderDB + fileFolderError.moveFolder,
            );
        }
    }

    async deleteFolderForScheduler(folders: number[], @TransactionManager() manager: EntityManager) {
        try {
            await manager
                .createQueryBuilder()
                .delete()
                .from(FileFolder)
                .where('FOLDER_PK IN(:...folders)', { folders })
                .execute();
        } catch (err) {
            throw stackAikoError(
                err,
                'FileFolderRepository/deleteFolderForScheduler',
                500,
                headErrorCode.fileFolderDB + fileFolderError.deleteFolderForScheduler,
            );
        }
    }
}
