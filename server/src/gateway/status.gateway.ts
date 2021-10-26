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
import { User } from 'src/entity';
import { UserInfo } from 'src/interfaces/MVC/accountMVC';
import SocketService from 'src/services/socket.service';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';
import { AikoError } from 'src/Helpers';

@WebSocketGateway({ cors: true, namespace: 'status' })
export default class StatusGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(private socketService: SocketService) {}

    @WebSocketServer()
    private readonly wss: Server;
    private readonly logger: Logger = new Logger('Websocket gateway');

    afterInit(server: Server) {
        this.logger.log('status socket initialized');
    }

    /**
     * 1. 커넥션을 하기 전에 UserGuard를 거쳐서 decoded된 userInfo를 받는다.
     * 2. status/handleConnection 현 이벤트로 유저정보를 전달한다.
     * 3. 회사를 구독하고 해당 회사에 유저정보를 날린다.
     * 4. 날려진 유저정보는 해당 이벤트를 구독하는 유저들에게 날아온다
     * 5. 이를 통해 해당 유저의 접속 상태를 확인 가능하다.
     */
    @SubscribeMessage('handleConnection')
    async handleConnection(client: Socket, userPayload: IUserPayload) {
        try {
            const { COMPANY_PK } = userPayload;
            const { id } = client;
            // join company
            client.join(COMPANY_PK.toString());
            // connection check and select user info
            const connectionResult = await this.socketService.statusConnection(id, userPayload);

            if (connectionResult.isSendable)
                this.wss
                    .to(COMPANY_PK.toString())
                    .except(client.id)
                    .emit('client/status/connected', connectionResult.user);
        } catch (err) {
            client.to(client.id).emit('client/error', err);
        }
    }

    /**
     * 1. 소켓 커넥션을 종료하여 오프라인 상태로 변경한다.
     * 2. 5분간의 로그인 유예상태를 준다. 왜냐하면 페이지 변경시 소켓 연결이 끊기기 때문이다.
     * 3. 유예기간 내 재접속을 하게 되면 handleConnection에서 감지하여 알람을 보내지 않는다.
     * 4. 유예기간이 지나 재접속을 하게 되면 알람을 보낸다.
     * @param client
     */
    @SubscribeMessage('handleDisconnect')
    async handleDisconnect(client: Socket) {
        try {
            this.socketService.statusDisonnect(client.id);
        } catch (err) {
            client.to(client.id).emit('client/error', err);
        }
    }
}
