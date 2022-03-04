import { Injectable } from '@nestjs/common';
import { FileFolder } from 'src/entity';
import FileHistory from 'src/entity/fileHistory.entity';
import FileKeys from 'src/entity/fileKeys.entity';
import { AikoError, getRepo, unixTimeStamp } from 'src/Helpers';
import { deleteFiles, getServerTime, stackAikoError } from 'src/Helpers/functions';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { filePath } from 'src/interfaces/MVC/fileMVC';
import FileBinRepository from 'src/mapper/fileBin.repository';
import FileFolderRepository from 'src/mapper/fileFolder.repository';
import FileHistoryRepository from 'src/mapper/fileHistory.repository';
import FileKeysRepository from 'src/mapper/fileKeys.repository';
import FolderBinRepository from 'src/mapper/folderBin.repository';
import { EntityManager, getConnection } from 'typeorm';

enum driveServiceError {
    saveFiles = 1,
    getFiles = 2,
    createFolder = 3,
    createRootFolder = 4,
    deleteFiles = 5,
    viewFolder = 6,
    moveFolder = 7,
    deleteBinFiles = 8,
    updateFile = 9,
    getFileHistory = 10,
}

@Injectable()
export default class DriveService {
    async saveFiles(folderPK: number, USER_PK: number, companyPK: number, files: Express.Multer.File[]) {
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.startTransaction();
        const DATE = unixTimeStamp();

        let fileKeysList: Pick<FileKeys, 'FILE_KEY_PK'>[] = [];
        let historyKeyList: Pick<FileHistory, 'FH_PK'>[] = [];

        try {
            // * update total folder size
            const totFileSize = files.reduce((prev, curr) => curr.size + prev, 0);
            await getRepo(FileFolderRepository).updateFileSize(folderPK, companyPK, totFileSize, queryRunner.manager);

            // * create folder keys
            fileKeysList = await getRepo(FileKeysRepository).createFileKeys(
                files.length,
                folderPK,
                companyPK,
                queryRunner.manager,
            );

            // * create folder histories
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

            const filePKs = fileKeysList.map((fileKey) => fileKey.FILE_KEY_PK);
            return await getRepo(FileKeysRepository).getFiles(filePKs, companyPK);
        } catch (err) {
            console.log('🚀 ~ file: drive.service.ts ~ line 33 ~ DriveService ~ saveFiles ~ err', err);
            await queryRunner.rollbackTransaction();
            throw stackAikoError(err, 'DriveService/saveFiles', 500, headErrorCode.drive + driveServiceError.saveFiles);
        } finally {
            await queryRunner.release();
        }
    }

    async getFiles(filePKs: number | number[], companyPK: number) {
        try {
            return await getRepo(FileKeysRepository).getFiles(filePKs, companyPK);
        } catch (err) {
            throw stackAikoError(err, 'DriveService/getFiles', 500, headErrorCode.drive + driveServiceError.getFiles);
        }
    }

    async createFolder(companyPK: number, folderName: string, parentPK: number | undefined, manager?: EntityManager) {
        try {
            if (!parentPK) throw new AikoError('DriveService/createFolder/no-parent-pk', 500, 239181);

            // invalid user filter
            const folderInfo = await getRepo(FileFolderRepository).getFolderInfo(parentPK);
            console.log('🚀 ~ file: drive.service.ts ~ line 68 ~ DriveService ~ createFolder ~ folderInfo', folderInfo);

            if (!Array.isArray(folderInfo) && folderInfo.COMPANY_PK !== companyPK)
                throw new AikoError('DriveService/createFolder/invalidMember', 500, -1);

            return await getRepo(FileFolderRepository).createFolder(companyPK, folderName, parentPK, manager);
        } catch (err) {
            throw stackAikoError(
                err,
                'DriveService/createFolder',
                500,
                headErrorCode.drive + driveServiceError.createFolder,
            );
        }
    }

    async createRootFolder(companyPK: number, manager: EntityManager) {
        try {
            return await getRepo(FileFolderRepository).createFolder(companyPK, 'root', undefined, manager);
        } catch (err) {
            throw stackAikoError(
                err,
                'DriveService/createRootFolder',
                500,
                headErrorCode.drive + driveServiceError.createRootFolder,
            );
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
                // * root folder check
                const folderList = await getRepo(FileFolderRepository).getFolderInfo(folderPKs);
                console.log('🚀 ~ file: drive.service.ts ~ line 139 ~ DriveService ~ folderList', folderList);
                let isRootFolder = false;
                const isArr = Array.isArray(folderList);

                if (isArr) {
                    isRootFolder = folderList.some(
                        (folder) => folder.PARENT_PK === undefined || folder.PARENT_PK === null,
                    );
                    folderPKList.concat(folderList.map((folder) => folder.FOLDER_PK));
                } else {
                    console.log('여기로 가야해요');
                    isRootFolder = folderList.PARENT_PK === undefined || folderList.PARENT_PK === null;
                    folderPKList.push(folderList.FOLDER_PK);
                }
                if (isRootFolder) throw new AikoError('DriveService/deleteFiles/rootFolderError', 0, -1);
                const folders = await getRepo(FileFolderRepository).getAllChildrenWithMyself(folderPKs, companyPK);

                const tempPks = folders?.map((folder) => folder.FOLDER_PK);
                if (folderPKs) folderPKList.concat(tempPks);
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
                let filesInFolder: FileKeys[] = [];
                if (folderPKList.length >= 1) {
                    filesInFolder = await getRepo(FileKeysRepository).getFilesInFolder(folderPKList, companyPK);
                }
                const isArray = Array.isArray(selectedFiles);
                if (isArray) filePKs = selectedFiles.map((file) => file.FILE_KEY_PK);
                else filePKs = [selectedFiles.FILE_KEY_PK];
                filePKs = filePKs.concat(filesInFolder.map((file) => file.FILE_KEY_PK));
                console.log('🚀 ~ file: drive.service.ts ~ line 174 ~ DriveService ~ filePKs', filePKs);

                // * delete process
                if (filePKs.length >= 1) {
                    await getRepo(FileKeysRepository).deleteFiles(filePKs, companyPK, queryRunner.manager);
                }
            }

            console.log('file delete is completed');
            flag = true;
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw stackAikoError(
                err,
                'DriveService/deleteFiles',
                500,
                headErrorCode.drive + driveServiceError.deleteFiles,
            );
        } finally {
            await queryRunner.release();
        }

        if (flag) return flag;
    }

    async viewFolder(companyPK: number, folderPK: number) {
        try {
            const directChildrenFolders = await getRepo(FileFolderRepository).getDirectChildren(folderPK, companyPK);
            const filesInFolder = await getRepo(FileKeysRepository).getFilesInfoInFolder(folderPK, companyPK);

            return { directChildrenFolders, filesInFolder };
        } catch (err) {
            throw stackAikoError(
                err,
                'DriveService/viewFolder',
                500,
                headErrorCode.drive + driveServiceError.viewFolder,
            );
        }
    }

    async moveFolder(fromFilePKs: number[], fromFolderPKs: number[], toFolderPK: number, companyPK: number) {
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.startTransaction();
        try {
            if (fromFilePKs.length > 0) {
                const folderInfos = (await getRepo(FileFolderRepository).getFolderInfo([
                    ...fromFolderPKs,
                    toFolderPK,
                ])) as FileFolder[];

                // * company validation check
                const isInValidAccess = folderInfos.some((info) => info.COMPANY_PK !== companyPK);
                if (isInValidAccess) throw new AikoError('DriveService/moveFolder/invalid-access', 500, 1928421);

                await getRepo(FileFolderRepository).moveFolder(toFolderPK, fromFolderPKs, queryRunner.manager);
            } else {
                const folderInfos = (await getRepo(FileFolderRepository).getFolderInfo(toFolderPK)) as FileFolder;

                // * company validation check
                if (folderInfos.COMPANY_PK !== companyPK)
                    throw new AikoError('DriveService/moveFolder/invalid-access', 500, -1);
            }

            await getRepo(FileKeysRepository).moveFile(toFolderPK, fromFilePKs, queryRunner.manager);

            await queryRunner.commitTransaction();
            return true;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw stackAikoError(
                err,
                'DriveService/moveFolder',
                500,
                headErrorCode.drive + driveServiceError.moveFolder,
            );
        } finally {
            await queryRunner.release();
        }
    }

    async deleteBinFiles(serverHour: number) {
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.startTransaction();

        try {
            const serverTime = getServerTime(serverHour);
            const limitTime = serverTime - 1000 * 60 * 60 * 24 * 30;

            const fileBinList = await getRepo(FileBinRepository).getDeleteFlagFiles(limitTime);
            const flaggedFileList = fileBinList.map((bin) => bin.FILE_KEY_PK);
            const flaggedFileInfoList = (await getRepo(FileKeysRepository).getFiles(flaggedFileList)) as FileKeys[];

            const folderBinList = await getRepo(FolderBinRepository).getDeleteFlagFolder(limitTime);
            const flaggedFolderList = folderBinList.map((bin) => bin.FOLDER_PK);

            // * folder delete (RDB)
            await getRepo(FolderBinRepository).deleteFolderForScheduler(flaggedFolderList, queryRunner.manager);
            await getRepo(FileFolderRepository).deleteFolderForScheduler(flaggedFolderList, queryRunner.manager);

            // * file delete (RDB)
            await getRepo(FileBinRepository).deleteFilesForScheduler(flaggedFileList, queryRunner.manager);
            await getRepo(FileKeysRepository).deleteFlagFiles(flaggedFileList, queryRunner.manager);
            await getRepo(FileHistoryRepository).deletedFlagFiles(flaggedFileList, queryRunner.manager);

            const fileNames: string[] = [];
            flaggedFileInfoList.forEach((file) =>
                file.fileHistories.forEach((history) => fileNames.push(history.NAME)),
            );

            await queryRunner.commitTransaction();

            // * files delete (physical)
            deleteFiles(filePath.DRIVE, ...fileNames);
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw stackAikoError(
                err,
                'DriveService/deleteBinFiles',
                500,
                headErrorCode.drive + driveServiceError.deleteBinFiles,
            );
        } finally {
            await queryRunner.release();
        }
    }

    async updateFile(filePK: number, file: Express.Multer.File, companyPK: number, userPK: number) {
        try {
            console.log('되고 있음?', filePK, companyPK);
            const dbFile = (await this.getFiles(filePK, companyPK)) as FileKeys;
            console.log(dbFile);
            const { folder } = dbFile;
            console.log('되는중3');
            await getRepo(FileHistoryRepository).updateHistory(
                folder.FOLDER_PK,
                dbFile.FILE_KEY_PK,
                file,
                companyPK,
                userPK,
            );
            console.log('되는중4');
        } catch (err) {
            throw stackAikoError(
                err,
                'DriveService/updateFile',
                500,
                headErrorCode.drive + driveServiceError.updateFile,
            );
        }
    }

    async getFileHistory(fileKey: number, companyPK: number) {
        try {
            const histories = await getRepo(FileHistoryRepository).getFileHistory(fileKey, companyPK);

            return histories;
        } catch (err) {
            throw stackAikoError(
                err,
                'DriveService/getFileHistory',
                500,
                headErrorCode.drive + driveServiceError.getFileHistory,
            );
        }
    }
}
