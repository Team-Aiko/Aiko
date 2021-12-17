import { EntityRepository, Repository } from 'typeorm';
import { ChatFile } from 'src/entity';
import { AikoError } from 'src/Helpers/classes';
import { IFileBundle } from 'src/interfaces/MVC/fileMVC';
@EntityRepository(ChatFile)
export default class ChatFileRepository extends Repository<ChatFile> {
    async uploadFilesOnChatMsg(
        { FILE_NAME, ORIGINAL_NAME, FILE_SIZE }: IFileBundle,
        chatRoomId: string,
    ): Promise<number> {
        let id = -1;

        try {
            const rawResult = await this.createQueryBuilder()
                .insert()
                .into(ChatFile)
                .values({ FILE_NAME, CR_PK: chatRoomId, ORIGINAL_NAME, FILE_SIZE })
                .execute();
            id = rawResult.raw.id as number;
        } catch (err) {
            throw new AikoError('chatFile/uploadFilesOnChatMsg', 500, 500360);
        }

        return id;
    }

    async viewFilesOnChatMsg(fileId: number) {
        try {
            return await this.createQueryBuilder('cf').where('cf.CF_PK = :CF_PK', { CF_PK: fileId }).getOneOrFail();
        } catch (err) {
            throw new AikoError('chatFile/viewFilesOnChatMsg', 500, 500360);
        }
    }
}
