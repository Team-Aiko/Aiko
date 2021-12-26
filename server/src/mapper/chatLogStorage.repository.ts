import ChatLogStorage from 'src/entity/chatLogStorage.entity';
import { AikoError } from 'src/Helpers';
import { stackAikoError } from 'src/Helpers/functions';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { EntityRepository, Repository } from 'typeorm';

enum chatLogStorageError {
    saveChatLogs = 1,
    getPrivateChatLog = 2,
}

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
            throw stackAikoError(
                err,
                'ChatLogStorageRepository/saveChatLogs',
                500,
                headErrorCode.chatLogStorageDB + chatLogStorageError.saveChatLogs,
            );
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
            throw stackAikoError(
                err,
                'ChatLogStorageRepository/getPrivateChatLog',
                500,
                headErrorCode.chatLogStorageDB + chatLogStorageError.getPrivateChatLog,
            );
        }
    }
}
