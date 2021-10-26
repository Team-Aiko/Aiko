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
import { IOneToOnePacket } from 'src/interfaces/MVC/socketMVC';
import { User } from 'src/entity';

// * Redis
import SocketService from '../services/socket.service';

const appSettings = config.get<IWebSocketConfig>('WEB_SOCKET');

/**
 * OnGatewayInit: 서버측 소켓이 열린 직후 실행되는 메소드
 * OnGatewayConnection: 특정 유저가 소켓에 접속할 때 실행되는 메소드
 * OnGatewayDisconnection: 특정 유저가 소켓에서 접속을 끊을 때 실행되는 메소드
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

    @SubscribeMessage('handleConnection')
    async handleConnection(client: Socket, userInfo: User) {
        /**
         * client.id: 소켓에 접속한 클라이언트의 고유아이디
         */
        console.log(userInfo);
        if (userInfo?.USER_PK) {
            console.log('당분간의 테스트를 위해서 아래 부분 주석(커넥션)', client.id);
        }
        // this.logger.log(`socket user connection: ${client.id}`);
        // if (client?.id && userInfo?.USER_PK) {
        //     const flag = await this.socketService.addSocketId(client.id, userInfo);
        //     if (flag) {
        //         const chatRoomList = await this.socketService.getOneToOneChatRoomList(
        //             userInfo?.USER_PK,
        //             userInfo?.COMPANY_PK,
        //         );
        //         this.wss.to(client.id).emit('client/OTOChatRoomList', chatRoomList);
        //         // client.emit('client/OTOChatRoomList', chatRoomList);
        //     }
        // }
    }

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

    @SubscribeMessage('handleDisconnection')
    handleDisconnect(client: Socket) {
        /**
         * client.id: 소켓에 접속한 클라이언트의 고유아이디
         */
        console.log('당분간의 테스트를 위해서 아래 부분 주석(커넥션해제)', client.id);
        // if (client?.id) {
        //     this.logger.log(`socket user disconnection: ${client.id}`);
        //     this.socketService.removeSocketId(client.id);
        //     client.emit('userDisconnect', client.id);
        // }
    }

    @SubscribeMessage('msgToServer')
    handleMessage(client: Socket, payload: IOneToOnePacket): WsResponse<IOneToOnePacket> {
        return { event: 'msgToClient', data: payload };
    }
}
