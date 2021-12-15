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
import { statusPath } from 'src/interfaces/MVC/socketMVC';
import StatusService from 'src/services/status.service';
import { getSocketErrorPacket, tokenParser } from 'src/Helpers/functions';

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
    async handleConnection(client: Socket, accessToken: string) {
        console.log('handleConnection method', accessToken);

        try {
            if (!accessToken) return;

            const { USER_PK, COMPANY_PK } = tokenParser(accessToken);

            // connection check and select user info
            const connResult = await this.statusService.statusConnection(accessToken, client.id);

            // join company
            client.join(`company:${COMPANY_PK}`);

            if (connResult.isSendable) {
                this.wss
                    .to(`company:${COMPANY_PK}`)
                    .except(connResult.myClients.map((client) => client.clientId))
                    .emit(statusPath.CLIENT_LOGIN_ALERT, connResult);

                const statusList = await this.statusService.getStatusList(USER_PK);
                this.wss.to(client.id).emit(statusPath.CLIENT_GET_STATUS_LIST, statusList);
            }
        } catch (err) {
            this.wss
                .to(client.id)
                .emit(statusPath.CLIENT_ERROR, getSocketErrorPacket(statusPath.HANDLE_CONNECTION, err, accessToken));
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
            this.statusService.statusDisconnect(client.id, this.wss);
        } catch (err) {
            this.wss
                .to(client.id)
                .emit(statusPath.CLIENT_ERROR, getSocketErrorPacket(statusPath.HANDLE_DISCONNECT, err, undefined));
        }
    }

    /**
     * 가상안: status = 1. 일반 / 2. 부재중 / 3. 바쁨 / 4. 회의중 / -1. 로그아웃
     * @param client
     * @param userStatus
     */
    @SubscribeMessage(statusPath.SERVER_CHANGE_STATUS)
    async changeStatus(client: Socket, stat: number) {
        console.log('changeStatus method');

        try {
            if (!stat) return;

            const status = await this.statusService.changeStatus(client.id, stat);
            this.wss.to(`company:${status.companyPK}`).except(client.id).emit(statusPath.CLIENT_CHANGE_STATUS, status);
        } catch (err) {
            this.wss
                .to(client.id)
                .emit(statusPath.CLIENT_ERROR, getSocketErrorPacket(statusPath.SERVER_CHANGE_STATUS, err, stat));
        }
    }
}
