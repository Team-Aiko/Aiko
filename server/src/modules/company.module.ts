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
import { AccountModule } from '.';

@Module({
    imports: [AccountModule],
    controllers: [CompanyController],
    providers: [CompanyService],
    exports: [CompanyService],
})
export default class CompanyModule {}
