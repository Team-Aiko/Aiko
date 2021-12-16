import { Injectable } from '@nestjs/common';
import { getRepo } from 'src/Helpers';
import { getUnixTime } from 'src/Helpers/functions';
import ChatLogStorageRepository from 'src/mapper/chatLogStorage.repository';

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
            throw err;
        }
    }
}
