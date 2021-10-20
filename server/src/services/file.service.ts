import { IFileService } from 'src/interfaces';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { ChatFileRepository } from 'src/entity';

@Injectable()
export default class FileService implements IFileService {
    constructor(
        @InjectRepository(ChatFileRepository)
        private chatFileRepo: Repository<ChatFileRepository>,
    ) {}

    async uploadFilesOnChatMsg(fileRoot: string, sender: number, receiver: number): Promise<number> {
        const rawResult = await this.chatFileRepo
            .createQueryBuilder()
            .insert()
            .into(ChatFileRepository)
            .values({ FILE_ROOT: fileRoot, SENDER: sender, RECEIVER: receiver })
            .execute();
        return rawResult.raw.id;
    }

    async viewFilesOnChatMsg(fileId: number): Promise<string> {
        try {
            const result = await this.chatFileRepo
                .createQueryBuilder('cf')
                .where('cf.CF_PK = CF_PK', { CF_PK: fileId })
                .getOneOrFail();
            return result?.FILE_ROOT;
        } catch (err) {
            console.error(err);
            return '';
        }
    }
}
