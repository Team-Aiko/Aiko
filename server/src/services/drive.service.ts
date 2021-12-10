import { Injectable } from '@nestjs/common';
import FileHistory from 'src/entity/fileHistory.entity';
import FileKeys from 'src/entity/fileKeys.entity';
import { getRepo, unixTimeStamp } from 'src/Helpers';
import FileFolderRepository from 'src/mapper/fileFolder.repository';
import FileHistoryRepository from 'src/mapper/fileHistory.repository';
import FileKeysRepository from 'src/mapper/fileKeys.repository';
import { EntityManager, getConnection } from 'typeorm';

@Injectable()
export default class DriveService {
    async saveFiles(folderPK: number, USER_PK: number, files: Express.Multer.File[]) {
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.startTransaction();
        const DATE = unixTimeStamp();

        let fileKeysList: Pick<FileKeys, 'FILE_KEY_PK'>[] = [];
        let historyKeyList: Pick<FileHistory, 'FH_PK'>[] = [];

        try {
            fileKeysList = await getRepo(FileKeysRepository).createFileKeys(
                files.length,
                folderPK,
                queryRunner.manager,
            );

            const fileHistoryList = files.map((file, idx) => ({
                DATE,
                FILE_KEY_PK: fileKeysList[idx].FILE_KEY_PK,
                NAME: file.filename,
                ORIGINAL_NAME: file.originalname,
                SIZE: file.size,
                USER_PK,
            }));

            historyKeyList = await getRepo(FileHistoryRepository).createFileHistory(
                fileHistoryList,
                queryRunner.manager,
            );

            await queryRunner.commitTransaction();
        } catch (err) {
            console.log('🚀 ~ file: drive.service.ts ~ line 33 ~ DriveService ~ saveFiles ~ err', err);
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
            return await getRepo(FileKeysRepository).getFiles(fileKeysList.map((fileKey) => fileKey.FILE_KEY_PK));
        }
    }

    async getFiles(filePKs: number | number[]) {
        try {
            return await getRepo(FileKeysRepository).getFiles(filePKs);
        } catch (err) {
            throw err;
        }
    }

    async createFolder(companyPK: number, folderName: string, parentPK: number | undefined, manager?: EntityManager) {
        try {
            return await getRepo(FileFolderRepository).createFolder(companyPK, folderName, parentPK, manager);
        } catch (err) {
            throw err;
        }
    }

    async deleteFiles(filePKs: number | number[]) {
        try {
        } catch (err) {
            throw err;
        }
    }
}
