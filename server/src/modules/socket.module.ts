import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import StatusGateway from 'src/gateway/status.gateway';
import { PrivateChatlog, PrivateChatlogSchema } from 'src/schemas/chatlog.schema';
import PrivateChatGateway from 'src/gateway/privateChat.gateway';
import GroupChatGateway from 'src/gateway/groupChat.gateway';
import { Status, StatusSchema } from 'src/schemas/status.schema';
import { GroupChatClientInfo, GroupChatClientInfoSchema } from 'src/schemas/groupChatClientInfo.schema';
import { GroupChatLog, groupChatLogSchema } from 'src/schemas/groupChatlog.schema';
import PrivateChatService from 'src/services/privateChat.service';
import GroupChatService from 'src/services/groupChat.service';
import StatusService from 'src/services/status.service';
import { StatusClientStorage, statusClientStorageSchema } from 'src/schemas/statusClientStorage.shcema';
import AccountService from 'src/services/account.service';
import { AccountModule } from '.';
import { PrivateChatClientInfo, PrivateChatClientInfoSchema } from 'src/schemas/privateChatClientInfo.schema';

const mongoModule = MongooseModule.forFeature([
    { name: PrivateChatlog.name, schema: PrivateChatlogSchema },
    { name: Status.name, schema: StatusSchema },
    { name: GroupChatClientInfo.name, schema: GroupChatClientInfoSchema },
    { name: GroupChatLog.name, schema: groupChatLogSchema },
    { name: StatusClientStorage.name, schema: statusClientStorageSchema },
    { name: PrivateChatClientInfo.name, schema: PrivateChatClientInfoSchema },
]);

@Module({
    imports: [mongoModule],
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
