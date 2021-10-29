import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WsResponse,
    WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import * as config from 'config';
import { Server, Socket } from 'socket.io';
import { IWebSocketConfig } from 'src/interfaces';
import { IOneToOnePacket, otoPath } from 'src/interfaces/MVC/socketMVC';
import { User } from 'src/entity';

// * Redis
import SocketService from '../services/socket.service';

const appSettings = config.get<IWebSocketConfig>('WEB_SOCKET');

/**
 * OnGatewayInit: 서버측 소켓이 열린 직후 실행되는 메소드
 * OnGatewayConnection: 특정 유저가 소켓에 접속할 때 실행되는 메소드
 * OnGatewayDisconnection: 특정 유저가 소켓에서 접속을 끊을 때 실행되는 메소드
 * 에러코드1: 채팅 유저 등록 실패
 */
@WebSocketGateway({ cors: true, namespace: 'chat1' })
export default class OneToOneMessageGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(private socketService: SocketService) {}
    @WebSocketServer()
    wss: Server;

    private logger: Logger = new Logger('Websocket gateway');

    afterInit(server: Server) {
        // gateway initialization
        this.logger.log('OneToOneMessageGateway initialized');
    }

    @SubscribeMessage(otoPath.HANDLE_CONNECTION)
    async handleConnection(client: Socket, userInfo: User) {
        if (client?.id && userInfo?.USER_PK) {
            console.log('valid socket connection', client.id);
            const flag = await this.socketService.addSocketId(client.id, userInfo);

            if (flag) {
                const chatRoomList = await this.socketService.getOneToOneChatRoomList(
                    userInfo?.USER_PK,
                    userInfo?.COMPANY_PK,
                );

                // subscribe chat rooms
                chatRoomList.forEach((room) => client.join(room.CR_PK));
                // subscribe company rooms
                client.join(`company:${userInfo.COMPANY_PK}`);
                // send chat room list to new client
                this.wss.to(client.id).emit(otoPath.CLIENT_CONNECTED, chatRoomList);
                // broadcast new client info to other members
                this.wss
                    .to(`company:${userInfo.COMPANY_PK}`)
                    .except(client.id)
                    .emit(otoPath.CLIENT_USERINFO_BROADCAST, userInfo);
            } else {
                this.wss.to(client.id).emit(otoPath.CLIENT_ERROR, 1);
            }
        }
    }

    @SubscribeMessage(otoPath.HANDLE_DISCONNECT)
    async handleDisconnect(client: Socket) {
        console.log('handleDisconnect', client.id);

        // find userPK
        const userPK = await this.socketService.findOtoUser(client.id);
        // delete process
        const flag = await this.socketService.delOtoUser(userPK as number, client.id);
        if (flag) client.disconnect();
    }

    @SubscribeMessage(otoPath.SERVER_SEND)
    async sendMessage(client: Socket, payload: IOneToOnePacket) {
        await this.socketService.addOtoChat(payload);
        this.wss.to(payload.roomId).emit(otoPath.CLIENT_SEND, payload);
    }

    @SubscribeMessage(otoPath.SERVER_CALL_CHAT_LOG)
    async callChatLog(client: Socket, payload: { companyPK: number; roomId: string }) {
        const chatLog = await this.socketService.callChatLog(payload.roomId, payload.companyPK);
        this.wss.to(payload.roomId).emit(otoPath.CLIENT_RECEIVE_CHAT_LOG, chatLog);
    }

    /**
     *
     * up service events
     *
     * divide line
     *
     * down: test events
     */

    /**
     *
     * @param client
     * @param rooms
     */
    @SubscribeMessage('server/joinRoom')
    async joinRoom(client: Socket, rooms: string[]) {
        rooms.forEach((room) => client.join(room));
        client.emit('client/joinedRoom', true);
    }

    @SubscribeMessage('server/leaveRoom')
    async leaverRoom(client: Socket, rooms: string[]) {
        rooms.forEach((room) => client.leave(room));
        client.emit('client/leftRoom', true);
    }

    @SubscribeMessage('server/sendMsg')
    async sendMsg(client: Socket, payload: IOneToOnePacket) {
        this.wss.to(payload.roomId).emit('msgToClient', payload);
    }

    // 테스트를 위한 소켓 이벤트
    @SubscribeMessage('server/test')
    async testSendMsg(client: Socket, payload: any) {
        console.log('server/test clientID = ', client.id);
        console.log('server/test payload = ', payload);
        this.socketService.testSendMsg('서비스 테스트');
        this.wss.emit('client/test', payload);
    }
    @SubscribeMessage('server/test/joinRoom')
    async testRoomJoin(client: Socket, payload: { roomId: string; msg: string }) {
        client.join(payload.roomId);
        console.log(payload.roomId);
        this.wss.to(payload.roomId).emit('client/test/joinedRoom', payload.msg);
    }
    @SubscribeMessage('server/test/room/sendMsg')
    async testRoomSendMsg(client: Socket, payload: { roomId: string; msg: string }) {
        this.wss.to(payload.roomId).emit('client/test/room/sendMsg', payload.msg);
    }

    @SubscribeMessage('msgToServer')
    handleMessage(client: Socket, payload: IOneToOnePacket): WsResponse<IOneToOnePacket> {
        return { event: 'msgToClient', data: payload };
    }
}
