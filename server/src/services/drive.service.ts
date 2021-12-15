import { Injectable } from '@nestjs/common';
import { FileFolder } from 'src/entity';
import FileBin from 'src/entity/fileBin.entity';
import FileHistory from 'src/entity/fileHistory.entity';
import FileKeys from 'src/entity/fileKeys.entity';
import { AikoError, getRepo, unixTimeStamp } from 'src/Helpers';
import FileBinRepository from 'src/mapper/fileBin.repository';
import FileFolderRepository from 'src/mapper/fileFolder.repository';
import FileHistoryRepository from 'src/mapper/fileHistory.repository';
import FileKeysRepository from 'src/mapper/fileKeys.repository';
import { EntityManager, getConnection } from 'typeorm';

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

    async getFiles(filePKs: number | number[], companyPK: number) {
        try {
            return await getRepo(FileKeysRepository).getFiles(filePKs, companyPK);
        } catch (err) {
            throw err;
        }
    }

    async createFolder(companyPK: number, folderName: string, parentPK: number | undefined, manager?: EntityManager) {
        try {
            if (!parentPK) throw new AikoError('DriveService/createFolder/no-parent-pk', 500, 239181);

            // invalid user filter
            const folderInfo = await getRepo(FileFolderRepository).getFolderInfo(parentPK);
            console.log('🚀 ~ file: drive.service.ts ~ line 68 ~ DriveService ~ createFolder ~ folderInfo', folderInfo);

            if (!Array.isArray(folderInfo) && folderInfo.COMPANY_PK !== companyPK)
                throw new AikoError('DriveService/createFolder/invalidMember', 500, 239182);

            return await getRepo(FileFolderRepository).createFolder(companyPK, folderName, parentPK, manager);
        } catch (err) {
            throw err;
        }
    }

    async deleteFiles(
        { filePKs, folderPKs }: { filePKs: number | number[]; folderPKs: number | number[] },
        userPK: number,
        companyPK: number,
    ) {
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.startTransaction();
        let flag = false;

        try {
            // * folder delete process
            let folderPKList: number[] = [];

            if (folderPKs !== -1) {
                const folders = await getRepo(FileFolderRepository).getAllChildren(folderPKs, companyPK);

                folderPKList = folders?.map((folder) => folder.FOLDER_PK);
                console.log('🚀 ~ file: drive.service.ts ~ line 98 ~ DriveService ~ folderPKList', folderPKList);

                await getRepo(FileFolderRepository).deleteFolderAndFiles(
                    folderPKList,
                    companyPK,
                    userPK,
                    queryRunner.manager,
                );
            }

            console.log('folder delete is completed');
            // * file delete process
            if (filePKs !== -1) {
                // * check valid deletes
                const selectedFiles = await getRepo(FileKeysRepository).getFiles(filePKs, companyPK);
                const filesInFolder = await getRepo(FileKeysRepository).getFilesInFolder(folderPKList, companyPK);
                const isArray = Array.isArray(selectedFiles);
                if (isArray) filePKs = selectedFiles.map((file) => file.FILE_KEY_PK);
                else filePKs = [selectedFiles.FILE_KEY_PK];
                filePKs.concat(filesInFolder.map((file) => file.FILE_KEY_PK));

                // * delete process
                await getRepo(FileKeysRepository).deleteFiles(filePKs, companyPK, queryRunner.manager);
            }

            console.log('file delete is completed');
            flag = true;
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }

        if (flag) return flag;
    }
}
