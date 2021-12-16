import { Injectable } from '@nestjs/common';
import { ChatFileRepository } from 'src/mapper';
import { getRepo } from 'src/Helpers/functions';
import { AikoError } from 'src/Helpers/classes';
import { IFileBundle } from 'src/interfaces/MVC/fileMVC';
import UserProfileFileRepository from 'src/mapper/userProfileFile.repository';
import { NoticeBoardFileRepository } from 'src/mapper';
import FileHistoryRepository from 'src/mapper/fileHistory.repository';
@Injectable()
export default class FileService {
    async uploadFilesOnChatMsg(bundle: IFileBundle, chatRoomId: string): Promise<number> {
        try {
            return await getRepo(ChatFileRepository).uploadFilesOnChatMsg(bundle, chatRoomId);
        } catch (err) {
            throw err;
        }
    }

    async viewFilesOnChatMsg(fileId: number) {
        try {
            return await getRepo(ChatFileRepository).viewFilesOnChatMsg(fileId);
        } catch (err) {
            throw new AikoError('testError', 451, 500000);
        }
    }

    async viewProfileFile(fileId: number) {
        try {
            return await getRepo(UserProfileFileRepository).viewProfileFile(fileId);
        } catch (err) {
            throw err;
        }
    }
    async downloadNoticeBoardFile(fileId: number, comPk: number) {
        return await getRepo(NoticeBoardFileRepository).downloadFile(fileId, comPk);
    }

    async downloadDriveFiles(fileId: number, companyPK: number) {
        try {
            const { NAME, ORIGINAL_FILE_NAME } = await getRepo(FileHistoryRepository).downloadDriveFiles(
                fileId,
                companyPK,
            );

            return { NAME, ORIGINAL_FILE_NAME };
        } catch (err) {
            throw err;
        }
    }
}
