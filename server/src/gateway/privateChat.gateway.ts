import { Logger } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IMessagePayload, privateChatPath } from 'src/interfaces/MVC/socketMVC';
import { AikoError } from 'src/Helpers';
import PrivateChatService from 'src/services/privateChat.service';

@WebSocketGateway({ cors: true, namespace: 'private-chat' })
export default class PrivateChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(private privateChatService: PrivateChatService) {}

    @WebSocketServer()
    private readonly wss: Server;
    private readonly logger = new Logger('Websocket gateway');

    afterInit(server: any) {
        this.logger.log('private chat gateway initialized');
    }

    @SubscribeMessage(privateChatPath.HANDLE_CONNECTION)
    async handleConnection(client: Socket, userInfo: { userPK: number; companyPK: number }) {
        try {
            // null data filter
            if (!userInfo) return;

            const roomList = await this.privateChatService.connectPrivateChat(client.id, userInfo);

            roomList.forEach((room) => client.join(room.CR_PK));

            this.wss.to(client.id).emit(privateChatPath.CLIENT_CONNECTED, roomList);
        } catch (err) {
            if (err instanceof AikoError) throw err;
        }
    }

    @SubscribeMessage(privateChatPath.SERVER_SEND)
    async sendMessage(client: Socket, payload: IMessagePayload) {
        try {
            // null data filter
            if (!payload) return;

            await this.privateChatService.sendMessage(payload);
            this.wss.to(payload.roomId).emit(privateChatPath.CLIENT_SEND, payload);
        } catch (err) {
            if (err instanceof AikoError) throw err;
        }
    }

    @SubscribeMessage(privateChatPath.SERVER_CALL_CHAT_LOG)
    async callChatlog(client: Socket, roomId: string) {
        try {
            // null data filter
            if (!roomId) return;

            const chatlog = await this.privateChatService.getChalog(roomId);
            this.wss.to(client.id).emit(privateChatPath.CLIENT_RECEIVE_CHAT_LOG, chatlog);
        } catch (err) {
            if (err instanceof AikoError) throw err;
        }
    }

    @SubscribeMessage(privateChatPath.HANDLE_DISCONNECT)
    async handleDisconnect(client: Socket) {
        this.logger.log(`disconnect client: ${client.id}`);
    }
}
