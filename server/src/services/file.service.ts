import { Injectable } from '@nestjs/common';
import { ChatFileRepository } from 'src/mapper';
import { getRepo, stackAikoError } from 'src/Helpers/functions';
import { AikoError } from 'src/Helpers/classes';
import { IFileBundle } from 'src/interfaces/MVC/fileMVC';
import UserProfileFileRepository from 'src/mapper/userProfileFile.repository';
import { NoticeBoardFileRepository } from 'src/mapper';
import FileHistoryRepository from 'src/mapper/fileHistory.repository';
import FileKeysRepository from 'src/mapper/fileKeys.repository';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';

enum fileServiceError {
    uploadFilesOnChatMsg = 1,
    viewFilesOnChatMsg = 2,
    viewProfileFile = 3,
    downloadNoticeBoardFile = 4,
    downloadDriveFiles = 5,
}
@Injectable()
export default class FileService {
    async uploadFilesOnChatMsg(bundle: IFileBundle, chatRoomId: string): Promise<number> {
        try {
            return await getRepo(ChatFileRepository).uploadFilesOnChatMsg(bundle, chatRoomId);
        } catch (err) {
            throw stackAikoError(
                err,
                'FileService/uploadFilesOnChatMsg',
                500,
                headErrorCode.file + fileServiceError.uploadFilesOnChatMsg,
            );
        }
    }

    async viewFilesOnChatMsg(fileId: number) {
        try {
            return await getRepo(ChatFileRepository).viewFilesOnChatMsg(fileId);
        } catch (err) {
            throw stackAikoError(
                err,
                'FileService/viewFilesOnChatMsg',
                500,
                headErrorCode.file + fileServiceError.viewFilesOnChatMsg,
            );
        }
    }

    async viewProfileFile(fileId: number) {
        try {
            return await getRepo(UserProfileFileRepository).viewProfileFile(fileId);
        } catch (err) {
            throw stackAikoError(
                err,
                'FileService/viewProfileFile',
                500,
                headErrorCode.file + fileServiceError.viewProfileFile,
            );
        }
    }
    async downloadNoticeBoardFile(fileId: number, comPk: number) {
        try {
            return await getRepo(NoticeBoardFileRepository).downloadFile(fileId, comPk);
        } catch (err) {
            throw stackAikoError(
                err,
                'FileService/downloadNoticeBoardFile',
                500,
                headErrorCode.file + fileServiceError.downloadNoticeBoardFile,
            );
        }
    }

    async downloadDriveFiles(fileId: number, companyPK: number) {
        try {
            const fileInfo = await getRepo(FileKeysRepository).getAFileInfo(fileId, companyPK);
            if (fileInfo.COMPANY_PK !== companyPK)
                throw new AikoError('FileService/downloadDriveFiles/invalid access', 500, -1);

            const { NAME, ORIGINAL_FILE_NAME } = await getRepo(FileHistoryRepository).downloadDriveFiles(fileId);

            return { NAME, ORIGINAL_FILE_NAME };
        } catch (err) {
            throw stackAikoError(
                err,
                'FileService/downloadDriveFiles',
                500,
                headErrorCode.file + fileServiceError.downloadDriveFiles,
            );
        }
    }
}
