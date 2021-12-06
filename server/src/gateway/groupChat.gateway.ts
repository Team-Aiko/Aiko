import { Logger, UseGuards } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from 'src/entity';
import { UserGuard } from 'src/guard/user.guard';
import { getRepo } from 'src/Helpers';
import { groupChatPath } from 'src/interfaces/MVC/socketMVC';
import { UserRepository } from 'src/mapper';
import { GroupChatClientInfo } from 'src/schemas/groupChatClientInfo.schema';
import GroupChatService from 'src/services/groupChat.service';

@UseGuards(UserGuard)
@WebSocketGateway({ cors: true, namespace: 'group-chat' })
export default class GroupChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    private readonly wss: Server;
    private readonly logger = new Logger('group-chat gateway');

    constructor(private readonly groupChatService: GroupChatService) {}

    afterInit(server: any) {
        this.logger.log('group-chat gateway initialized');
    }
    @SubscribeMessage(groupChatPath.HANDLE_CONNECTION)
    async handleConnection(client: Socket, userInfo: User) {
        try {
            if (!client) return;

            console.log('groupChat connection clientId : ', client.id);
            await this.groupChatService.addClientForGroupChat(client.id, userInfo);
        } catch (err) {
            console.error(err);
        }
    }

    @SubscribeMessage(groupChatPath.HANDLE_DISCONNECT)
    async handleDisconnect(client: Socket) {
        try {
            if (!client) return;

            console.log('groupChat disconnect clientId : ', client.id);
        } catch (err) {
            console.error(err);
        }
    }

    @SubscribeMessage(groupChatPath.CREATE_GROUP_CHAT_ROOM)
    async createGroupChatRoom(
        client: Socket,
        {
            userList,
            admin,
            roomTitle,
            maxNum,
        }: { userList: number[]; admin: number; roomTitle: string; maxNum: number },
    ) {
        try {
            if (!client) return;

            console.log('createGroupChatRoom clientId : ', client.id);
            const { GC_PK, memberList, COMPANY_PK } = await this.groupChatService.createGroupChatRoom({
                userList,
                admin,
                roomTitle,
                maxNum,
            });

            memberList.forEach((member) => {
                this.wss.to(member.clientId).emit(groupChatPath.CLIENT_JOIN_ROOM_NOTICE, { GC_PK, memberList });
            });
        } catch (err) {
            console.error(err);
        }
    }

    @SubscribeMessage(groupChatPath.SERVER_JOIN_GROUP_CHAT_ROOM)
    async joinGroupChatRoom(client: Socket, { GC_PK, userPK }: { GC_PK: number; userPK: number }) {
        try {
            if (!client) return;

            const userInfo = await getRepo(UserRepository).getUserInfoWithUserPK(userPK);

            client.join(`company:${userInfo.COMPANY_PK}-${GC_PK}`);
            this.wss.to(client.id).emit(groupChatPath.CLIENT_JOINED_GCR, true);
        } catch (err) {
            console.error(err);
        }
    }

    @SubscribeMessage(groupChatPath.SERVER_SEND_MESSAGE)
    async sendMessageToGroup(
        client: Socket,
        payload: { GC_PK: number; sender: number; file: number; message: string },
    ) {
        try {
            if (!client) return;

            await this.groupChatService.sendMessageToGroup(payload, this.wss);
        } catch (err) {
            console.error(err);
        }
    }

    // * test reactors
    @SubscribeMessage(groupChatPath.TEST_ADD_NEW_CLIENT)
    async addNewClientForGroupChat(client: Socket, userPK: number) {
        try {
            if (!client) return;

            this.groupChatService.addNewClientForGroupChat(userPK);
        } catch (err) {
            console.error(err);
        }
    }
}
