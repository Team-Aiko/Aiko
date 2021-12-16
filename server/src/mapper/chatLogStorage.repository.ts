import ChatLogStorage from 'src/entity/chatLogStorage.entity';
import { AikoError } from 'src/Helpers';
import {
    Brackets,
    EntityManager,
    EntityRepository,
    InsertResult,
    Repository,
    Transaction,
    TransactionManager,
} from 'typeorm';

@EntityRepository(ChatLogStorage)
export default class ChatLogStorageRepository extends Repository<ChatLogStorage> {
    async saveChatLogs(
        messages: {
            sender: number;
            file: number;
            message: string;
            date: number;
        }[],
        roomId: string,
    ) {
        try {
            await this.insert(
                messages.map((message) => ({
                    CR_PK: roomId,
                    CF_PK: message.file,
                    MESSAGE: message.message,
                    SENDER: message.sender,
                    DATE: message.date,
                })),
            );
        } catch (err) {
            console.log(err);
            throw new AikoError('ChatLogStorageRepository/saveChatLogs', 500, 1892384);
        }
    }

    async getPrivateChatLog(roomId: string, startTime: number, endTime: number) {
        try {
            return await this.createQueryBuilder()
                .where(`CR_PK = '${roomId}'`)
                .andWhere(`DATE >= ${startTime}`)
                .andWhere(`DATE < ${endTime}`)
                .getMany();
        } catch (err) {
            console.error(err);
            throw new AikoError('ChatLogStorageRepository/getPrivateChatLog', 500, 192849);
        }
    }
}
