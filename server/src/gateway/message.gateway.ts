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
import { IWebSocketConfig, IOneToOnePacket } from 'src/interfaces';
import { User } from 'src/entity';

// * Redis
import SocketService from '../services/socket.service';

const appSettings = config.get<IWebSocketConfig>('WEB_SOCKET');

/**
 * OnGatewayInit: 서버측 소켓이 열린 직후 실행되는 메소드
 * OnGatewayConnection: 특정 유저가 소켓에 접속할 때 실행되는 메소드
 * OnGatewayDisconnection: 특정 유저가 소켓에서 접속을 끊을 때 실행되는 메소드
 */
@WebSocketGateway({ cors: true })
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
        this.logger.log(`socket user connection: ${client.id}`);
        if (client?.id && userInfo?.USER_PK) {
            const flag = await this.socketService.addSocketId(client.id, userInfo);

            if (flag) {
                const chatRoomList = await this.socketService.getOneToOneChatRoomList(
                    userInfo?.USER_PK,
                    userInfo?.COMPANY_PK,
                );

                this.wss.to(client.id).emit('OTOChatRoomList', chatRoomList);
                // client.emit('client/OTOChatRoomList', chatRoomList);
            }
        }
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

    @SubscribeMessage('handleDisconnection')
    handleDisconnect(client: Socket) {
        /**
         * client.id: 소켓에 접속한 클라이언트의 고유아이디
         */
        if (client?.id) {
            this.logger.log(`socket user disconnection: ${client.id}`);
            this.socketService.removeSocketId(client.id);
            client.emit('userDisconnect', client.id);
        }
    }

    @SubscribeMessage('msgToServer')
    handleMessage(client: Socket, payload: IOneToOnePacket): WsResponse<IOneToOnePacket> {
        return { event: 'msgToClient', data: payload };
    }
}
