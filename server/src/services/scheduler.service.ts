import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AikoError } from 'src/Helpers';
import GroupChatService from './groupChat.service';
import PrivateChatService from './privateChat.service';

@Injectable()
export default class SchedulerService {
    private readonly logger = new Logger(SchedulerService.name);

    constructor(private privateChatService: PrivateChatService, private groupChatService: GroupChatService) {}

    @Cron('0 0 0 * * *') // everyday at AM 12
    async storePrivateChatLogsToRDB() {
        try {
            this.privateChatService.storePrivateChatLogsToRDB();
        } catch (err) {
            console.error(err);
            throw new AikoError('SchedulerService/storePrivateChatLogsToRDB', 500, 192945);
        }
    }
}
