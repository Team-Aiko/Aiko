import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import AccountController from 'src/controllers/account.controller';
import AccountService from '../services/account.service';
import SocketService from 'src/services/socket.service';
import { filePath } from 'src/interfaces/MVC/fileMVC';
import MeetingService from 'src/services/meeting.service';
import WorkService from 'src/services/work.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PrivateChatlog, PrivateChatlogSchema } from 'src/schemas/chatlog.schema';
import { Status, StatusSchema } from 'src/schemas/status.schema';
import { GroupChatClientInfo, GroupChatClientInfoSchema } from 'src/schemas/groupChatClientInfo.schema';
import PrivateChatService from 'src/services/privateChat.service';
import GroupChatService from 'src/services/groupChat.service';
import StatusService from 'src/services/status.service';

@Module({
    imports: [
        // file upload multer module
        MulterModule.register({
            dest: filePath.PROFILE,
        }),
        // mongodb imports
        MongooseModule.forFeature([
            { name: PrivateChatlog.name, schema: PrivateChatlogSchema },
            { name: Status.name, schema: StatusSchema },
            { name: GroupChatClientInfo.name, schema: GroupChatClientInfoSchema },
        ]),
    ],
    controllers: [AccountController],
    providers: [
        AccountService,
        StatusService,
        GroupChatService,
        PrivateChatService,
        // SocketService,
        MeetingService,
        WorkService,
    ],
    exports: [AccountService],
})
export default class AccountModule {}
