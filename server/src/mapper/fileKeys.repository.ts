import FileKeys from 'src/entity/fileKeys.entity';
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
            throw new AikoError('FileKeysRepository/createFileKeys', 500, 292102);
        }
    }

    async getFiles(filePKs: number[] | number, COMPANY_PK: number) {
        const isArray = Array.isArray(filePKs);

        try {
            const whereCondition = isArray ? 'fk.FILE_KEY_PK IN (:...filePKs)' : 'fk.FILE_KEY_PK = :filePKs';
            const fraction = this.createQueryBuilder('fk')
                .leftJoinAndSelect('fk.folder', 'folder')
                .leftJoinAndSelect('fk.fileHistories', 'fileHistories')
                .leftJoinAndSelect('fileHistories.user', 'user')
                .leftJoinAndSelect('user.department', 'department')
                .where(whereCondition, { filePKs })
                .andWhere('fk.COMPANY_PK = :COMPANY_PK', { COMPANY_PK })
                .andWhere('fk.IS_DELETED = 0');

            return isArray ? await fraction.getMany() : await fraction.getOne();
        } catch (err) {
            console.error(err);
            throw new AikoError('FileKeysRepository/getFiles', 500, 928192);
        }
    }

    async getFilesInFolder(folderPKs: number | number[], companyPK: number) {
        try {
            const isArray = Array.isArray(folderPKs);
            const whereCondition = `FOLDER_PK ${isArray ? 'IN(:...folderPKs)' : '= :folderPKs'}`;
            return await this.createQueryBuilder().where(whereCondition, { folderPKs }).getMany();
        } catch (err) {
            console.error(err);
            throw new AikoError('FileKeysRepository/getFilesInFolder', 500, 912030);
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
            throw new AikoError('FileKeysRepository/deleteFiles', 500, 910292);
        }
    }

    async selectFilesInFolder(FOLDER_PK: number) {
        try {
            return await this.find({ FOLDER_PK });
        } catch (err) {
            console.error(err);
            throw new AikoError('FileKeysRepository/selectFilesInFolder', 500, 190284);
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
            throw new AikoError('FileKeysRepository/getFilesInfoInFolder', 500, 182934);
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
            throw new AikoError('FileKeysRepository/moveFile', 500, 8918277);
        }
    }
}
