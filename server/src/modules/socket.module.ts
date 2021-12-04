import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import SocketController from 'src/controllers/socket.controller';
import StatusGateway from 'src/gateway/status.gateway';
// import SocketService from 'src/services/socket.service';
import { PrivateChatlog, PrivateChatlogSchema } from 'src/schemas/chatlog.schema';
import PrivateChatGateway from 'src/gateway/privateChat.gateway';
import GroupChatGateway from 'src/gateway/groupChat.gateway';
import { Status, StatusSchema } from 'src/schemas/status.schema';
import { GroupChatClientInfo, GroupChatClientInfoSchema } from 'src/schemas/groupChatClientInfo.schema';
import { GroupChatLog, groupChatLogSchema } from 'src/schemas/groupChatlog.schema';
import PrivateChatService from 'src/services/privateChat.service';
import GroupChatService from 'src/services/groupChat.service';
import StatusService from 'src/services/status.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: PrivateChatlog.name, schema: PrivateChatlogSchema },
            { name: Status.name, schema: StatusSchema },
            { name: GroupChatClientInfo.name, schema: GroupChatClientInfoSchema },
            { name: GroupChatLog.name, schema: groupChatLogSchema },
        ]),
    ],
    // controllers: [SocketController],
    providers: [
        // SocketService,
        PrivateChatService,
        GroupChatService,
        StatusService,
        StatusGateway,
        PrivateChatGateway,
        GroupChatGateway,
    ],
    exports: [
        // SocketService,
        PrivateChatService,
        GroupChatService,
        StatusService,
        StatusGateway,
        PrivateChatGateway,
        GroupChatGateway,
    ],
})
export default class SocketModule {}
