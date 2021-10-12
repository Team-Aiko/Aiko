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

@WebSocketGateway()
export default class OneToOneMessageGateway implements OnGatewayInit {
    private logger: Logger = new Logger('Websocket gateway');

    afterInit(server: any) {
        // gateway initialization
        this.logger.log('custom initialized');
    }

    @SubscribeMessage('msgToServer')
    handleMessage(client: any, payload: any): string {
        return 'hello world';
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
