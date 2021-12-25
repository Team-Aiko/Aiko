import FileKeys from 'src/entity/fileKeys.entity';
import { AikoError } from 'src/Helpers';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { EntityRepository, Repository, TransactionManager, EntityManager } from 'typeorm';

enum fileKeysError {
    createFileKeys = 1,
    getFiles = 2,
    getAFileInfo = 3,
    getFilesInFolder = 4,
    deleteFiles = 5,
    selectFilesInFolder = 6,
    getFilesInfoInFolder = 7,
    moveFile = 8,
    deleteFlagFiles = 9,
}

type FileOrFiles = Express.Multer.File | Express.Multer.File[];

@EntityRepository(FileKeys)
export default class FileKeysRepository extends Repository<FileKeys> {
    async createFileKeys(
        count: number,
        FOLDER_PK: number,
        COMPANY_PK: number,
        @TransactionManager() manager: EntityManager,
    ) {
        console.log('🚀 ~ file: fileKeys.repository.ts ~ line 17 ~ FileKeysRepository ~ createFileKeys ~ count', count);

        try {
            const list: Pick<FileKeys, 'FOLDER_PK' | 'COMPANY_PK'>[] = [];

            for (let i = 0; i < count; i++) {
                list.push({ FOLDER_PK, COMPANY_PK });
            }
            const insertedResult = await manager.insert(FileKeys, list);

            return insertedResult.identifiers as Pick<FileKeys, 'FILE_KEY_PK'>[];
        } catch (err) {
            console.error(err);
            throw new AikoError(
                'FileKeysRepository/createFileKeys',
                500,
                headErrorCode.fileKeysDB + fileKeysError.createFileKeys,
            );
        }
    }

    async getFiles(filePKs: number[] | number, COMPANY_PK?: number) {
        const isArray = Array.isArray(filePKs);

        try {
            const optional = Boolean(COMPANY_PK);
            const whereCondition = isArray ? 'fk.FILE_KEY_PK IN (:...filePKs)' : 'fk.FILE_KEY_PK = :filePKs';
            let fraction = this.createQueryBuilder('fk')
                .leftJoinAndSelect('fk.folder', 'folder')
                .leftJoinAndSelect('fk.fileHistories', 'fileHistories')
                .leftJoinAndSelect('fileHistories.user', 'user')
                .leftJoinAndSelect('user.department', 'department')
                .where(whereCondition, { filePKs })
                .andWhere('fk.IS_DELETED = 0');

            if (optional) fraction = fraction.andWhere('fk.COMPANY_PK = :COMPANY_PK', { COMPANY_PK });

            return isArray ? await fraction.getMany() : await fraction.getOne();
        } catch (err) {
            console.error(err);
            throw new AikoError('FileKeysRepository/getFiles', 500, headErrorCode.fileKeysDB + fileKeysError.getFiles);
        }
    }

    async getAFileInfo(fileId: number, companyPK: number) {
        try {
            return await this.createQueryBuilder()
                .where(`FILE_KEY_PK = ${fileId}`)
                .andWhere(`COMPANY_PK = ${companyPK}`)
                .getOneOrFail();
        } catch (err) {
            console.error(err);
            throw new AikoError(
                'FileKeysRepository/getAFileInfo',
                500,
                headErrorCode.fileKeysDB + fileKeysError.getAFileInfo,
            );
        }
    }

    async getFilesInFolder(folderPKs: number | number[], companyPK: number) {
        try {
            const isArray = Array.isArray(folderPKs);
            const whereCondition = `FOLDER_PK ${isArray ? 'IN(:...folderPKs)' : '= :folderPKs'}`;
            return await this.createQueryBuilder().where(whereCondition, { folderPKs }).getMany();
        } catch (err) {
            console.error(err);
            throw new AikoError(
                'FileKeysRepository/getFilesInFolder',
                500,
                headErrorCode.fileKeysDB + fileKeysError.getFilesInFolder,
            );
        }
    }

    async deleteFiles(filePKs: number | number[], COMPANY_PK: number, @TransactionManager() manager: EntityManager) {
        try {
            const isArray = Array.isArray(filePKs);
            const whereCondition = `FILE_KEY_PK ${isArray ? 'IN (:...filePKs)' : '= :filePKs'}`;

            await manager
                .createQueryBuilder(FileKeys, 'fk')
                .update()
                .set({ IS_DELETED: 1 })
                .where(whereCondition, { filePKs })
                .andWhere('fk.COMPANY_PK = :COMPANY_PK', { COMPANY_PK })
                .execute();

            return true;
        } catch (err) {
            console.error(err);
            throw new AikoError(
                'FileKeysRepository/deleteFiles',
                500,
                headErrorCode.fileKeysDB + fileKeysError.deleteFiles,
            );
        }
    }

    async selectFilesInFolder(FOLDER_PK: number) {
        try {
            return await this.find({ FOLDER_PK });
        } catch (err) {
            console.error(err);
            throw new AikoError(
                'FileKeysRepository/selectFilesInFolder',
                500,
                headErrorCode.fileKeysDB + fileKeysError.selectFilesInFolder,
            );
        }
    }

    async getFilesInfoInFolder(FOLDER_PK: number, COMPANY_PK: number) {
        try {
            return await this.createQueryBuilder('fk')
                .leftJoinAndSelect('fk.fileHistories', 'fileHistories')
                .leftJoinAndSelect('fileHistories.user', 'user')
                .where(`fk.FOLDER_PK = ${FOLDER_PK}`)
                .andWhere(`fk.COMPANY_PK = ${COMPANY_PK}`)
                .getMany();
        } catch (err) {
            console.error(err);
            throw new AikoError(
                'FileKeysRepository/getFilesInfoInFolder',
                500,
                headErrorCode.fileKeysDB + fileKeysError.getFilesInfoInFolder,
            );
        }
    }

    async moveFile(toFolderPK: number, fromFilePKs: number[], @TransactionManager() manager: EntityManager) {
        try {
            await manager
                .createQueryBuilder()
                .update(FileKeys)
                .set({ FOLDER_PK: toFolderPK })
                .where('FILE_KEY_PK IN (...:fromFilePKs)', { fromFilePKs })
                .execute();
        } catch (err) {
            console.error(err);
            throw new AikoError('FileKeysRepository/moveFile', 500, headErrorCode.fileKeysDB + fileKeysError.moveFile);
        }
    }

    async deleteFlagFiles(files: number[], @TransactionManager() manager: EntityManager) {
        try {
            await manager
                .createQueryBuilder()
                .delete()
                .from(FileKeys)
                .where('FILE_KEY_PK IN(:...files)', { files })
                .andWhere('IS_DELETED = 1')
                .execute();
        } catch (err) {
            console.error(err);
            throw new AikoError(
                'FileKeysRepository/deleteFlagFiles',
                500,
                headErrorCode.fileKeysDB + fileKeysError.deleteFlagFiles,
            );
        }
    }
}
