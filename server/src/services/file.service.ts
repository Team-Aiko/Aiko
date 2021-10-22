import { IFileService } from 'src/interfaces';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { ChatFile } from 'src/entity';
import { ChatFileRepository } from 'src/mapper';
import { getRepo } from 'src/Helpers/functions';

@Injectable()
export default class FileService implements IFileService {
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
            throw err;
        }
    }
}
