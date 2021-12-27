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
import { IMessagePayload, privateChatPath } from 'src/interfaces/MVC/socketMVC';
import PrivateChatService from 'src/services/privateChat.service';
import { getSocketErrorPacket, parseCookieString, parseUserPayloadString } from 'src/Helpers/functions';
import { SocketGuard } from 'src/guard/socket.guard';

@UseGuards(SocketGuard)
@WebSocketGateway({ cors: { credentials: true, origin: 'http://localhost:3000' }, namespace: 'private-chat' })
export default class PrivateChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(private privateChatService: PrivateChatService) {}

    @WebSocketServer()
    private readonly wss: Server;
    private readonly logger = new Logger('Websocket gateway');

    afterInit(server: any) {
        this.logger.log('private chat gateway initialized');
    }

    @SubscribeMessage(privateChatPath.HANDLE_CONNECTION)
    async handleConnection(client: Socket) {
        if (!client.request.headers['guardPassed']) return;

        try {
            const { COMPANY_PK, USER_PK } = parseUserPayloadString(client.request.headers['user-payload']);
            const { oddCase, evenCase } = await this.privateChatService.connectPrivateChat(USER_PK, COMPANY_PK);

            const roomList = oddCase.concat(evenCase);
            roomList.forEach((room) => client.join(room.CR_PK));

            this.wss.to(client.id).emit(privateChatPath.CLIENT_CONNECTED, { oddCase, evenCase });
        } catch (err) {
            this.wss
                .to(client.id)
                .emit(
                    privateChatPath.CLIENT_ERROR,
                    getSocketErrorPacket(privateChatPath.HANDLE_CONNECTION, err, undefined),
                );
        }
    }

    @SubscribeMessage(privateChatPath.SERVER_SEND)
    async sendMessage(client: Socket, payload: IMessagePayload) {
        if (!client.request.headers['guardPassed']) return;

        try {
            // null data filter
            if (!payload) return;

            const { COMPANY_PK, USER_PK } = parseUserPayloadString(client.request.headers['user-payload']);
            payload.sender = USER_PK;

            await this.privateChatService.sendMessage(payload);
            this.wss.to(payload.roomId).emit(privateChatPath.CLIENT_SEND, payload);
        } catch (err) {
            this.wss
                .to(client.id)
                .emit(privateChatPath.CLIENT_ERROR, getSocketErrorPacket(privateChatPath.SERVER_SEND, err, payload));
        }
    }

    @SubscribeMessage(privateChatPath.SERVER_CALL_CHAT_LOG)
    async callChatlog(client: Socket, roomId: string) {
        if (!client.request.headers['guardPassed']) return;

        try {
            // null data filter
            if (!roomId) return;

            const { COMPANY_PK, USER_PK } = parseUserPayloadString(client.request.headers['user-payload']);

            const chatlog = await this.privateChatService.getChalog(roomId);
            const roomInfos = await this.privateChatService.getUserInfo(roomId, COMPANY_PK, USER_PK);

            this.wss.to(client.id).emit(privateChatPath.CLIENT_RECEIVE_CHAT_LOG, { chatlog, info: roomInfos });
        } catch (err) {
            this.wss
                .to(client.id)
                .emit(
                    privateChatPath.CLIENT_ERROR,
                    getSocketErrorPacket(privateChatPath.SERVER_CALL_CHAT_LOG, err, roomId),
                );
        }
    }

    @SubscribeMessage(privateChatPath.HANDLE_DISCONNECT)
    async handleDisconnect(client: Socket) {
        if (!client.request.headers['guardPassed']) return;

        this.logger.log(`disconnect client: ${client.id}`);
        client.disconnect(true);
    }
}
