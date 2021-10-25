import { Injectable } from '@nestjs/common';
import { ChatFileRepository } from 'src/mapper';
import { getRepo } from 'src/Helpers/functions';
import { AikoError } from 'src/Helpers/classes';

@Injectable()
export default class FileService {
    async uploadFilesOnChatMsg(fileRoot: string, chatRoomId: string): Promise<number> {
        try {
            return await getRepo(ChatFileRepository).uploadFilesOnChatMsg(fileRoot, chatRoomId);
        } catch (err) {
            throw err;
        }
    }

    async viewFilesOnChatMsg(fileId: number): Promise<string> {
        try {
            return await getRepo(ChatFileRepository).viewFilesOnChatMsg(fileId);
        } catch (err) {
            throw new AikoError('testError', 451, 500000);
        }
    }
}
