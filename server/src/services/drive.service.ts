import { Injectable } from '@nestjs/common';
import { FolderBin } from 'src/entity';
import FileBin from 'src/entity/fileBin.entity';
import FileHistory from 'src/entity/fileHistory.entity';
import FileKeys from 'src/entity/fileKeys.entity';
import { AikoError, getRepo, unixTimeStamp } from 'src/Helpers';
import FileBinRepository from 'src/mapper/fileBin.repository';
import FileFolderRepository from 'src/mapper/fileFolder.repository';
import FileHistoryRepository from 'src/mapper/fileHistory.repository';
import FileKeysRepository from 'src/mapper/fileKeys.repository';
import FolderBinRepository from 'src/mapper/folderBin.repository';
import { EntityManager, getConnection, QueryRunner } from 'typeorm';

@Injectable()
export default class DriveService {
    async saveFiles(folderPK: number, USER_PK: number, companyPK: number, files: Express.Multer.File[]) {
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
                ORIGINAL_FILE_NAME: file.originalname,
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
            const filePKs = fileKeysList.map((fileKey) => fileKey.FILE_KEY_PK);
            return await getRepo(FileKeysRepository).getFiles(filePKs, companyPK);
        }
    }

    async deleteFolder(folderPK: number, companyPK: number, userPK: number) {
        const queryRunner = getConnection().createQueryRunner();
        let insertedResult1: Pick<FolderBin, 'FOLDER_BIN_PK'>[];
        let insertedResult2: number[];

        await queryRunner.startTransaction();
        try {
            // * 멤버의 회사와 폴더 소유회사가 일치하는지 확인
            const folderInfo = await getRepo(FileFolderRepository).getFolderInfo(folderPK);
            if (folderInfo.COMPANY_PK !== companyPK)
                throw new AikoError('DriveService/deleteFolder/invalid company member', 500, 918294);

            // * 삭제 프로세스 진행
            insertedResult1 = await getRepo(FolderBinRepository).deleteFolder(
                folderPK,
                companyPK,
                userPK,
                queryRunner.manager,
            );

            await getRepo(FileFolderRepository).deleteFolder(folderPK);
            const filePKs = folderInfo.fileKeys.map((key) => key.FILE_KEY_PK);
            insertedResult2 = await this.deleteFiles(filePKs, userPK, companyPK, queryRunner);
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }

        return { folderBinPK: insertedResult1[0].FOLDER_BIN_PK, fileBinPKs: insertedResult2 };
    }

    async getFiles(filePKs: number | number[], companyPK: number) {
        try {
            return await getRepo(FileKeysRepository).getFiles(filePKs, companyPK);
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

    async deleteFiles(filePKs: number | number[], userPK: number, companyPK: number, queryRunner?: QueryRunner) {
        const optionalFlag = Boolean(queryRunner);
        if (!optionalFlag) queryRunner = getConnection().createQueryRunner();

        await queryRunner.startTransaction();
        let insertedResults: Pick<FileBin, 'FB_PK'>[] = [];

        try {
            // * check valid deletes
            const selectedFiles = await getRepo(FileKeysRepository).getFiles(filePKs, companyPK);
            const isArray = Array.isArray(selectedFiles);
            if (isArray) filePKs = selectedFiles.map((file) => file.FILE_KEY_PK);
            else filePKs = [selectedFiles.FILE_KEY_PK];

            // * delete process
            await getRepo(FileKeysRepository).deleteFiles(filePKs, companyPK, queryRunner.manager);
            insertedResults = await getRepo(FileBinRepository).deleteFiles(
                filePKs,
                userPK,
                companyPK,
                queryRunner.manager,
            );
            console.log(
                '🚀 ~ file: drive.service.ts ~ line 76 ~ DriveService ~ deleteFiles ~ insertedResults',
                insertedResults,
            );
            if (!optionalFlag) await queryRunner.commitTransaction();
        } catch (err) {
            if (!optionalFlag) await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            if (!optionalFlag) await queryRunner.release();
        }

        return insertedResults?.map((insertedResult) => insertedResult.FB_PK);
    }
}
