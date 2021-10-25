import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { ChatFile } from 'src/entity';
import { AikoError } from 'src/Helpers/classes';
@EntityRepository(ChatFile)
export default class ChatFileRepository extends Repository<ChatFile> {
    async uploadFilesOnChatMsg(fileRoot: string, chatRoomId: string): Promise<number> {
        let id = -1;

        try {
            const rawResult = await this.createQueryBuilder()
                .insert()
                .into(ChatFile)
                .values({ FILE_ROOT: fileRoot, CR_PK: chatRoomId })
                .execute();
            id = rawResult.raw.id as number;
        } catch (err) {
            throw new AikoError('chatFile/uploadFilesOnChatMsg', 500, 500360);
        }

        return id;
    }

    async viewFilesOnChatMsg(fileId: number): Promise<string> {
        let file = '';

        try {
            const result = await this.createQueryBuilder('cf')
                .where('cf.CF_PK = :CF_PK', { CF_PK: fileId })
                .getOneOrFail();
            file = result?.FILE_ROOT;
        } catch (err) {
            throw new AikoError('chatFile/viewFilesOnChatMsg', 500, 500360);
        }

        return file;
    }
}
