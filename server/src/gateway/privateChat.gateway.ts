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
import { getSocketErrorPacket, parseCookieString } from 'src/Helpers/functions';
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
        try {
            const cookies = parseCookieString<{ ACCESS_TOKEN: string; REFRESH_TOKEN: string }>(
                client.request.headers.cookie,
            );

            // null data filter
            if (!cookies) return;
            const { oddCase, evenCase } = await this.privateChatService.connectPrivateChat(
                client.id,
                cookies.ACCESS_TOKEN,
            );

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
        try {
            // null data filter
            if (!payload) return;

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
        try {
            // null data filter
            if (!roomId) return;

            const chatlog = await this.privateChatService.getChalog(roomId);
            const userInfos = await this.privateChatService.getUserInfo(roomId);

            this.wss.to(client.id).emit(privateChatPath.CLIENT_RECEIVE_CHAT_LOG, { chatlog, ...userInfos });
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
        this.logger.log(`disconnect client: ${client.id}`);
    }

    // * for migration
    @SubscribeMessage('server/temp/generateChatRooms')
    async chatRoomGenerator(client: Socket, accessToken: string) {
        try {
            const result = await this.privateChatService.chatRoomGenerator(accessToken);
            console.log('all created : ', result);
        } catch (err) {
            console.error(err);
        }
    }
}
