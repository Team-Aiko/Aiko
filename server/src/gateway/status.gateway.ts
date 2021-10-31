import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import SocketService from 'src/services/socket.service';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';
import { AikoError, unknownError } from 'src/Helpers';
import { statusPath } from 'src/interfaces/MVC/socketMVC';

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
    @SubscribeMessage(statusPath.HANDLE_CONNECTION)
    async handleConnection(client: Socket, userPayload: IUserPayload) {
        try {
            if (userPayload) {
                console.log('client ID = ', client.id, ' user ID = ', userPayload.USER_PK);
                const { COMPANY_PK } = userPayload;
                const { id } = client;
                // join company
                client.join(COMPANY_PK.toString());
                // connection check and select user info
                const connectionResult = await this.socketService.statusConnection(id, userPayload);

                if (connectionResult.isSendable)
                    this.wss
                        .to(`company:${COMPANY_PK}`)
                        .except(client.id) // 자기자신을 제외한다 이 부분을 주석처리하면 자기한테도 접속사실이 전달됨.
                        .emit(statusPath.CLIENT_LOGIN_ALERT, connectionResult.user);
            }
        } catch (err) {
            client.to(client.id).emit(statusPath.CLIENT_ERROR, err instanceof AikoError ? err : unknownError);
        }
    }

    /**
     * 1. 소켓 커넥션을 종료하여 오프라인 상태로 변경한다.
     * 2. 5분간의 로그인 유예상태를 준다. 왜냐하면 페이지 변경시 소켓 연결이 끊기기 때문이다.
     * 3. 유예기간 내 재접속을 하게 되면 handleConnection에서 감지하여 알람을 보내지 않는다.
     * 4. 유예기간이 지나 재접속을 하게 되면 알람을 보낸다.
     * @param client
     */
    @SubscribeMessage(statusPath.HANDLE_DISCONNECT)
    async handleDisconnect(client: Socket) {
        try {
            console.log('client ID = ', client.id, 'status socket disconnection');
            this.socketService.statusDisconnect(client, this.wss);
        } catch (err) {
            client.to(client.id).emit(statusPath.CLIENT_ERROR, err instanceof AikoError ? err : unknownError);
        }
    }

    /**
     * 가상안: status = 1. 일반 / 2. 부재중 / 3. 바쁨 / 4. 회의중
     * @param client
     * @param userStatus
     */
    @SubscribeMessage(statusPath.SERVER_CHANGE_STATUS)
    async changeStatus(client: Socket, userStatus: number) {
        try {
            const socketId = client.id;
            const container = await this.socketService.getUserInfoStataus(socketId);
            this.wss
                .to(`${container.companyPK}`)
                .except(client.id)
                .emit(statusPath.CLIENT_CHANGE_STATUS, await this.socketService.changeStatus(socketId, userStatus));
        } catch (err) {
            client.to(client.id).emit(statusPath.CLIENT_ERROR, err instanceof AikoError ? err : unknownError);
        }
    }
}
