import { FileFolder } from 'src/entity';
import { AikoError } from 'src/Helpers';
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

    async getFolderInfo(FOLDER_PK: number) {
        try {
            return await this.createQueryBuilder('f')
                .leftJoinAndSelect('f.fileKeys', 'fileKeys')
                .leftJoinAndSelect('fileKeys.fileHistories', 'fileHistories')
                .where('f.FOLDER_PK = :FOLDER_PK', { FOLDER_PK })
                .getOneOrFail();
        } catch (err) {
            console.error(err);
            throw new AikoError('FileFolderRepository/getFolderInfo', 500, 918921);
        }
    }

    async deleteFolder(FOLDER_PK: number) {
        try {
            await this.update({ IS_DELETED: 1 }, { FOLDER_PK });
        } catch (err) {
            console.error(err);
            throw new AikoError('FileFolderRepository/deleteFolder', 500, 821882);
        }
    }

    async viewFolder(COMPANY_PK: number, FOLDER_PK: number) {
        try {
            const targetFolderInfo = await this.createQueryBuilder('ff')
                .leftJoinAndSelect('ff.fileKeys', 'fileKeys')
                .leftJoinAndSelect('fileKeys.fileHistories', 'fileHistories')
                .where('ff.COMPANY_PK = :COMPANY_PK', { COMPANY_PK })
                .getOneOrFail();
            const files = targetFolderInfo.fileKeys;
            const childrenFolders = await this.getChildrenFolder(FOLDER_PK);

            return { files, childrenFolders };
        } catch (err) {
            console.error(err);
            throw new AikoError('FileFolderRepository/viewFolder', 500, 9271827);
        }
    }

    async getChildrenFolder(PARENT_PK: number) {
        try {
            return await this.createQueryBuilder().where('PARENT_PK = :PARENT_PK', { PARENT_PK }).getMany();
        } catch (err) {
            console.error(err);
            throw new AikoError('FileFolderRepository/getChildrenFolder', 500, 928192);
        }
    }

    async getFolderPKsInTree(FOLDER_PK: number) {
        try {
            const sql = `with recursive getFolderPKsInTree `;
        } catch (err) {
            console.error(err);
            throw new AikoError('FileFolderRepository/getFolderPKsInTree', 500, 192849);
        }
    }
}
