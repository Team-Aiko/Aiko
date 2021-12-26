import { Injectable } from '@nestjs/common';
import { getRepo } from 'src/Helpers';
import { getUnixTime, stackAikoError } from 'src/Helpers/functions';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import ChatLogStorageRepository from 'src/mapper/chatLogStorage.repository';

enum chatServiceError {
    getPrivateChatLog = 1,
}

@Injectable()
export default class ChatService {
    async getPrivateChatLog(roomId: string, startTime: Date, endTime: Date) {
        try {
            const chatLogs = await getRepo(ChatLogStorageRepository).getPrivateChatLog(
                roomId,
                getUnixTime(startTime),
                getUnixTime(endTime),
            );

            return {
                chatLogs: chatLogs.map((log) => ({
                    messages: {
                        sender: log.SENDER,
                        file: log.CF_PK,
                        message: log.MESSAGE,
                        date: log.DATE,
                    },
                })),
                time: startTime,
            };
        } catch (err) {
            throw stackAikoError(
                err,
                'ChatSerivce/getPrivateChatLog',
                500,
                headErrorCode.chat + chatServiceError.getPrivateChatLog,
            );
        }
    }
}
