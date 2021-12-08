import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import CompanyController from 'src/controllers/company.controller';
import { PrivateChatlog, PrivateChatlogSchema } from 'src/schemas/chatlog.schema';
import { GroupChatClientInfo, GroupChatClientInfoSchema } from 'src/schemas/groupChatClientInfo.schema';
import { GroupChatLog, groupChatLogSchema } from 'src/schemas/groupChatlog.schema';
import { Status, StatusSchema } from 'src/schemas/status.schema';
import AccountService from 'src/services/account.service';
import CompanyService from 'src/services/company.service';
import GroupChatService from 'src/services/groupChat.service';
import MeetingService from 'src/services/meeting.service';
import PrivateChatService from 'src/services/privateChat.service';
import SocketService from 'src/services/socket.service';
import StatusService from 'src/services/status.service';
import WorkService from 'src/services/work.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: PrivateChatlog.name, schema: PrivateChatlogSchema },
            { name: Status.name, schema: StatusSchema },
            { name: GroupChatClientInfo.name, schema: GroupChatClientInfoSchema },
            { name: GroupChatLog.name, schema: groupChatLogSchema },
        ]),
    ],
    controllers: [CompanyController],
    providers: [
        CompanyService,
        AccountService,
        MeetingService,
        // SocketService,
        WorkService,
        PrivateChatService,
        GroupChatService,
        StatusService,
    ],
    exports: [CompanyService],
})
export default class CompanyModule {}
