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
import PrivateChatService from 'src/services/privateChat.service';
import { getSocketErrorPacket } from 'src/Helpers/functions';
import { AikoError } from 'src/Helpers';

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
    async handleConnection(client: Socket, socketToken: string) {
        if (!socketToken) return;
        try {
            const { COMPANY_PK, USER_PK } = await this.privateChatService.decodeSocketToken(socketToken);
            await this.privateChatService.addClient(client.id, USER_PK, COMPANY_PK); // 해당 유저의 소켓 접속정보를 저장
            const { oddCase, evenCase } = await this.privateChatService.connectPrivateChat(USER_PK, COMPANY_PK);

            const roomList = oddCase.concat(evenCase);
            roomList.forEach((room) => client.join(room.CR_PK));

            this.wss.to(client.id).emit(privateChatPath.CLIENT_CONNECTED, { oddCase, evenCase });
        } catch (err) {
            if ((err as AikoError).appCode === 4000000 + 19) {
                console.log('no socketToken');
                client.disconnect(true);
            } else {
                this.wss
                    .to(client.id)
                    .emit(
                        privateChatPath.CLIENT_ERROR,
                        getSocketErrorPacket(privateChatPath.HANDLE_CONNECTION, err, undefined),
                    );
            }
        }
    }

    @SubscribeMessage(privateChatPath.SERVER_SEND)
    async sendMessage(client: Socket, payload: IMessagePayload) {
        try {
            // null data filter
            if (!payload) return;

            const { userPK, companyPK } = await this.privateChatService.getClientInfo(client.id);
            payload.sender = userPK;

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

            const { userPK, companyPK } = await this.privateChatService.getClientInfo(client.id);

            const chatlog = await this.privateChatService.getChalog(roomId);
            const roomInfos = await this.privateChatService.getUserInfo(roomId, companyPK, userPK);

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
        this.logger.log(`disconnect client: ${client.id}`);
        await this.privateChatService.deleteClientInfo(client.id);
        client.disconnect(true);
    }

    @SubscribeMessage(privateChatPath.SERVER_LOGOUT_EVENT)
    async logoutEvent(client: Socket) {
        try {
            const { userPK, companyPK } = await this.privateChatService.getClientInfo(client.id);
            await this.privateChatService.logoutEvent(userPK, companyPK, client.id);
            this.wss.to(client.id).emit(privateChatPath.CLIENT_LOGOUT_EVENT_EXECUTED, true);
        } catch (err) {
            this.wss
                .to(client.id)
                .emit(
                    privateChatPath.CLIENT_ERROR,
                    getSocketErrorPacket(privateChatPath.SERVER_LOGOUT_EVENT, err, undefined),
                );
        }
    }
}
