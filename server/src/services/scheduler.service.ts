import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AikoError } from 'src/Helpers';
import DriveService from './drive.service';
import GroupChatService from './groupChat.service';
import PrivateChatService from './privateChat.service';

@Injectable()
export default class SchedulerService {
    private readonly logger = new Logger(SchedulerService.name);

    constructor(
        private privateChatService: PrivateChatService,
        private groupChatService: GroupChatService,
        private driveService: DriveService,
    ) {}

    @Cron('0 0 0 * * *') // everyday at AM 12
    async storePrivateChatLogsToRDB() {
        try {
            this.privateChatService.storePrivateChatLogsToRDB(0);
        } catch (err) {
            console.error(err);
            throw new AikoError('SchedulerService/storePrivateChatLogsToRDB', 500, 192945);
        }
    }

    @Cron('0 0 1 * * *') // everyday at AM 1
    async deleteBinFiles() {
        try {
            this.driveService.deleteBinFiles(1);
        } catch (err) {
            console.error(err);
            throw new AikoError('SchedulerService/deleteBinFiles', 500, 892819);
        }
    }

    @Cron('0 0 2 * * *')
    async storeGroupChatLog() {
        try {
            this.groupChatService.storeGroupChatLog(2);
        } catch (err) {
            console.error(err);
            throw new AikoError('SchedulerService/storeGroupChatLog', 500, 892820);
        }
    }
}
