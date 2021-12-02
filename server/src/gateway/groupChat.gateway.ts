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
import { UserGuard } from 'src/guard/user.guard';
import { groupChatPath } from 'src/interfaces/MVC/socketMVC';
import SocketService from 'src/services/socket.service';

@UseGuards(UserGuard)
@WebSocketGateway({ cors: true, namespace: 'group-chat' })
export default class GroupChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    private readonly wss: Server;
    private readonly logger = new Logger('group-chat gateway');

    constructor(private readonly socketService: SocketService) {}

    afterInit(server: any) {
        this.logger.log('group-chat gateway initialized');
    }
    @SubscribeMessage(groupChatPath.HANDLE_CONNECTION)
    async handleConnection(client: Socket, ...args: any[]) {
        try {
            if (client) {
                console.log('groupChat connection clientId : ', client.id);
            }
        } catch (err) {
            console.error(err);
        }
    }

    @SubscribeMessage(groupChatPath.HANDLE_DISCONNECT)
    async handleDisconnect(client: Socket) {
        try {
            if (client) {
                console.log('groupChat disconnect clientId : ', client.id);
            }
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
            if (client) {
                console.log('createGroupChatRoom clientId : ', client.id);
                this.socketService.createGroupChatRoom({
                    userList,
                    admin,
                    roomTitle,
                    maxNum,
                });
            }
        } catch (err) {
            console.error(err);
        }
    }
}
