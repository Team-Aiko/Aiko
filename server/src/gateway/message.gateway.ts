import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WsResponse,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import * as config from 'config';
import { Server, Socket } from 'socket.io';
import { IWebSocketConfig, UserInfo } from 'src/interfaces';
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
    // 나중에 추가할 예정
    // @WebSocketServer()
    // wss: Server;

    private logger: Logger = new Logger('Websocket gateway');

    afterInit(server: Server) {
        // gateway initialization
        this.logger.log('OneToOneMessageGateway initialized');
    }

    @SubscribeMessage('handleConnection')
    handleConnection(client: Socket, userInfo: UserInfo) {
        /**
         * client.id: 소켓에 접속한 클라이언트의 고유아이디
         */
        this.logger.log(`socket user connection: ${client.id}`);
        const flag = this.socketService.addSocketId(client.id, userInfo);
        const userListPromise = this.socketService.getMembers(userInfo.COMPANY_PK);
        userListPromise
            .then((data) => {
                client.emit('connected', {
                    header: flag,
                    userList: data,
                });
            })
            .catch((err) => {
                console.log(err);
            });
    }

    @SubscribeMessage('handleDisconnection')
    handleDisconnect(client: Socket) {
        /**
         * client.id: 소켓에 접속한 클라이언트의 고유아이디
         */
        this.logger.log(`socket user disconnection: ${client.id}`);
        this.socketService.removeSocketId(client.id);
        client.emit('userDisconnect', client.id);
    }

    @SubscribeMessage('msgToServer')
    handleMessage(client: Socket, payload: string): WsResponse<any> {
        // this.wss.emit('msgToClient', payload); // 나중에 추가할 예정
        // client.emit('msgToClient', payload); -> type unsafe emit
        return { event: 'msgToClient', data: payload }; // type safe emit
    }
}
