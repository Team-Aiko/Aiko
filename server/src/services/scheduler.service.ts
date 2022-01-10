import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AikoError } from 'src/Helpers';
import { stackAikoError } from 'src/Helpers/functions';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import DriveService from './drive.service';
import GroupChatService from './groupChat.service';
import PrivateChatService from './privateChat.service';

enum SchedulerServiceError {
    storePrivateChatLogsToRDB = 1,
    deleteBinFiles = 2,
    storeGroupChatLog = 3,
}

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
            throw stackAikoError(
                err,
                'SchedulerService/storePrivateChatLogsToRDB',
                500,
                headErrorCode.scheduler + SchedulerServiceError.storePrivateChatLogsToRDB,
            );
        }
    }

    @Cron('0 0 1 * * *') // everyday at AM 1
    async deleteBinFiles() {
        try {
            this.driveService.deleteBinFiles(1);
        } catch (err) {
            throw stackAikoError(
                err,
                'SchedulerService/deleteBinFiles',
                500,
                headErrorCode.scheduler + SchedulerServiceError.deleteBinFiles,
            );
        }
    }

    @Cron('0 0 2 * * *')
    async storeGroupChatLog() {
        try {
            this.groupChatService.storeGroupChatLog(2);
        } catch (err) {
            throw stackAikoError(
                err,
                'SchedulerService/storeGroupChatLog',
                500,
                headErrorCode.scheduler + SchedulerServiceError.storeGroupChatLog,
            );
        }
    }
}
