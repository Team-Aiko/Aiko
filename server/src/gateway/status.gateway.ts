import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';
import { AikoError, unknownError } from 'src/Helpers';
import { statusPath } from 'src/interfaces/MVC/socketMVC';
import StatusService from 'src/services/status.service';
import { UserGuard } from 'src/guard/user.guard';

@WebSocketGateway({ cors: true, namespace: 'status' })
export default class StatusGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(private statusService: StatusService) {}

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
        console.log('handleConnection method', userPayload);

        try {
            if (!userPayload) return;

            console.log('client ID = ', client.id, ' user ID = ', userPayload.USER_PK);
            const { id } = client;

            // connection check and select user info
            const connResult = await this.statusService.statusConnection(id, userPayload);

            // join company
            client.join(`company:${connResult.user.companyPK}`);

            if (connResult.isSendable)
                this.wss
                    .to(`company:${connResult.user.companyPK}`)
                    .except(client.id) // 자기자신을 제외한다 이 부분을 주석처리하면 자기한테도 접속사실이 전달됨.
                    .emit(statusPath.CLIENT_LOGIN_ALERT, connResult);
        } catch (err) {
            console.error('handleConnection error: ', err);
            this.wss.to(client.id).emit(statusPath.CLIENT_ERROR, err instanceof AikoError ? err : unknownError);
        }
    }

    // TODO: 로그아웃된 유저의 정보도 필요하므로 전체 유저정보를 호출하는 이벤트가 필요할 것으로 보임.

    /**
     * 1. 소켓 커넥션을 종료하여 오프라인 상태로 변경한다.
     * 2. 5분간의 로그인 유예상태를 준다. 왜냐하면 페이지 변경시 소켓 연결이 끊기기 때문이다.
     * 3. 유예기간 내 재접속을 하게 되면 handleConnection에서 감지하여 알람을 보내지 않는다.
     * 4. 유예기간이 지나 재접속을 하게 되면 알람을 보낸다.
     * @param client
     */
    @SubscribeMessage(statusPath.HANDLE_DISCONNECT)
    async handleDisconnect(client: Socket) {
        console.log('handleDisconnect method');

        try {
            console.log('client ID = ', client.id, 'status socket disconnection');
            this.statusService.statusDisconnect(client, this.wss);
        } catch (err) {
            this.wss.to(client.id).emit(statusPath.CLIENT_ERROR, err instanceof AikoError ? err : unknownError);
        }
    }

    /**
     * 가상안: status = 1. 일반 / 2. 부재중 / 3. 바쁨 / 4. 회의중 / -1. 로그아웃
     * @param client
     * @param userStatus
     */
    @SubscribeMessage(statusPath.SERVER_CHANGE_STATUS)
    async changeStatus(client: Socket, userStatus: { userPK: number; userStatus: number }) {
        console.log('changeStatus method');

        try {
            if (!userStatus) return;

            const socketId = client.id;
            const container = await this.statusService.getUserInfoStatus(socketId);
            console.log('🚀 ~ file: status.gateway.ts ~ line 85 ~ StatusGateway ~ changeStatus ~ container', container);
            const result = await this.statusService.changeStatus(socketId, userStatus);
            this.wss
                .to(`company:${container.companyPK}`)
                .except(client.id)
                .emit(statusPath.CLIENT_CHANGE_STATUS, result);
        } catch (err) {
            this.wss.to(client.id).emit(statusPath.CLIENT_ERROR, err instanceof AikoError ? err : unknownError);
        }
    }
}
