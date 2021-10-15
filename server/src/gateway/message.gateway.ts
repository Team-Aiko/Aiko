import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WsResponse,
    MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import * as config from 'config';
import { Server, Socket } from 'socket.io';
import { IWebSocketConfig } from 'src/interfaces';

const appSettings = config.get<IWebSocketConfig>('WEB_SOCKET');

/**
 * OnGatewayInit: 서버측 소켓이 열린 직후 실행되는 메소드
 * OnGatewayConnection: 특정 유저가 소켓에 접속할 때 실행되는 메소드
 * OnGatewayDisconnection: 특정 유저가 소켓에서 접속을 끊을 때 실행되는 메소드
 */
@WebSocketGateway()
export default class OneToOneMessageGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    // 나중에 추가할 예정
    // @WebSocketServer()
    // wss: Server;

    private logger: Logger = new Logger('Websocket gateway');

    afterInit(server: Server) {
        // gateway initialization
        this.logger.log('OneToOneMessageGateway initialized');
    }

    handleConnection(client: Socket, ...args: any[]) {
        /**
         * client.id: 소켓에 접속한 클라이언트의 고유아이디
         */
        this.logger.log('socket user connection: ', client.id);
    }

    handleDisconnect(client: Socket) {
        /**
         * client.id: 소켓에 접속한 클라이언트의 고유아이디
         */
        this.logger.log('socket user disconnection: ', client.id);
    }

    @SubscribeMessage('msgToServer')
    handleMessage(client: Socket, payload: string): WsResponse<any> {
        // this.wss.emit('msgToClient', payload); // 나중에 추가할 예정
        // client.emit('msgToClient', payload); -> type unsafe emit
        return { event: 'msgToClient', data: payload }; // type safe emit
    }

    // async handleConnection(socket: Socket) {
    //     socket.id;
    // }
    // @WebSocketServer() server: Server;
    // private logger = new Logger('OneToOneMessageGateway');
    // private getClientQuery(client: Socket) {
    //     return client.handshake.query as unknown as IClientQuery;
    // }
    // public async handleconnection(client: Socket) {
    //     const { user_id } = this.getClientQuery(client);
    //     return this.server.emit('event', { connected: user_id });
    // }
    // public async handleDisconnection(client: Socket) {
    //     const { user_id } = this.getClientQuery(client);
    //     const flag = this.server.emit('event', { disconnected: user_id });
    //     this.server.disconnectSockets();
    //     return flag;
    // }
}
