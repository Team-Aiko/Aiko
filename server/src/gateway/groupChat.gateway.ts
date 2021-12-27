import { Logger, UseGuards } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketGuard } from 'src/guard/socket.guard';
import { getSocketErrorPacket, parseUserPayloadString } from 'src/Helpers/functions';
import { groupChatPath } from 'src/interfaces/MVC/socketMVC';
import GroupChatService from 'src/services/groupChat.service';

@UseGuards(SocketGuard)
@WebSocketGateway({ cors: { credentials: true, origin: 'http://localhost:3000' }, namespace: 'group-chat' })
export default class GroupChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    private readonly wss: Server;
    private readonly logger = new Logger('group-chat gateway');

    constructor(private readonly groupChatService: GroupChatService) {}

    afterInit(server: any) {
        this.logger.log('group-chat gateway initialized');
    }

    /**
     * 소켓을 연결하는 이벤트
     * 자신이 속한 그룹챗방 리스트를 rdb로부터 받아오고 방에 조인시킨 뒤 그 리스트를 클라이언트로 보낸다.
     * @param client
     * @param userInfo
     * @returns
     */
    @SubscribeMessage(groupChatPath.HANDLE_CONNECTION)
    async handleConnection(client: Socket) {
        if (!client.request.headers['guardPassed']) return;

        try {
            const payloadStr = client.request.headers['user-payload'];
            const userPayload = parseUserPayloadString(payloadStr);

            console.log('groupChat connection clientId : ', client.id);
            // * add client info
            await this.groupChatService.addClientForGroupChat(client.id, userPayload);
            // * find group chat room infos
            const groupChatRooms = await this.groupChatService.findChatRooms(userPayload);

            // * join group chat
            groupChatRooms.forEach(({ GC_PK }) => {
                client.join(`company:${userPayload.COMPANY_PK}-${GC_PK}`);
            });

            this.wss.to(client.id).emit(groupChatPath.CLIENT_CONNECTED, groupChatRooms);
        } catch (err) {
            this.wss
                .to(client.id)
                .emit(
                    groupChatPath.CLIENT_ERROR_ALERT,
                    getSocketErrorPacket(groupChatPath.CLIENT_ERROR_ALERT, err, undefined),
                );
        }
    }

    /**
     * 소켓 연결을 해제하는 이벤트
     * @returns
     */
    @SubscribeMessage(groupChatPath.HANDLE_DISCONNECT)
    async handleDisconnect(client: Socket) {
        if (!client.request.headers['guardPassed']) return;

        try {
            console.log('groupChat disconnect clientId : ', client.id);
            await this.groupChatService.deleteClientInfo(client.id);
        } catch (err) {
            this.wss
                .to(client.id)
                .emit(
                    groupChatPath.CLIENT_ERROR_ALERT,
                    getSocketErrorPacket(groupChatPath.HANDLE_DISCONNECT, err, undefined),
                );
        }
    }

    /**
     * 그룹챗방을 생성하는 이벤트
     */
    @SubscribeMessage(groupChatPath.SERVER_CREATE_GROUP_CHAT_ROOM)
    async createGroupChatRoom(
        client: Socket,
        { userList, roomTitle, maxNum }: { userList: number[]; roomTitle: string; maxNum: number },
    ) {
        if (!client.request.headers['guardPassed']) return;

        try {
            const payloadStr = client.request.headers['user-payload'];
            const { USER_PK, COMPANY_PK } = parseUserPayloadString(payloadStr);

            if (!roomTitle) return;

            console.log('createGroupChatRoom clientId : ', client.id);
            const { GC_PK, memberList } = await this.groupChatService.createGroupChatRoom({
                userList,
                roomTitle,
                maxNum,
                USER_PK,
                COMPANY_PK,
            });

            memberList.forEach((member) => {
                this.wss.to(member.clientId).emit(groupChatPath.CLIENT_JOIN_ROOM_NOTICE, {
                    GC_PK,
                    memberList,
                    admin: USER_PK,
                    roomTitle,
                    maxNum,
                });
            });
        } catch (err) {
            this.wss.to(client.id).emit(
                groupChatPath.CLIENT_ERROR_ALERT,
                getSocketErrorPacket(groupChatPath.SERVER_CREATE_GROUP_CHAT_ROOM, err, {
                    userList,
                    roomTitle,
                    maxNum,
                }),
            );
        }
    }

    /**
     * 새로 생성된 방에 추가로 조인하는 이벤트
     */
    @SubscribeMessage(groupChatPath.SERVER_JOIN_GROUP_CHAT_ROOM)
    async joinGroupChatRoom(client: Socket, GC_PK: number) {
        if (!client.request.headers['guardPassed']) return;

        try {
            if (!GC_PK) return;

            const payloadStr = client.request.headers['user-payload'];
            const { USER_PK, COMPANY_PK } = parseUserPayloadString(payloadStr);

            // 해당 채팅룸에 조인하는 프로세스
            client.join(`company:${COMPANY_PK}-${GC_PK}`);
            // 조인이 완료됨을 보냄.
            this.wss.to(client.id).emit(groupChatPath.CLIENT_JOINED_GCR, true);
        } catch (err) {
            this.wss
                .to(client.id)
                .emit(
                    groupChatPath.CLIENT_ERROR_ALERT,
                    getSocketErrorPacket(groupChatPath.SERVER_JOIN_GROUP_CHAT_ROOM, err, GC_PK),
                );
        }
    }

    /**
     * 특정 그룹챗방에 메세지를 보내는 이벤트
     */
    @SubscribeMessage(groupChatPath.SERVER_SEND_MESSAGE)
    async sendMessageToGroup(client: Socket, payload: { GC_PK: number; file: number; message: string; date: number }) {
        if (!client.request.headers['guardPassed']) return;

        try {
            if (!payload) return;

            const payloadStr = client.request.headers['user-payload'];
            const { USER_PK, COMPANY_PK } = parseUserPayloadString(payloadStr);

            await this.groupChatService.sendMessageToGroup({ ...payload, USER_PK, COMPANY_PK }, this.wss);
        } catch (err) {
            this.wss
                .to(client.id)
                .emit(
                    groupChatPath.CLIENT_ERROR_ALERT,
                    getSocketErrorPacket(groupChatPath.SERVER_SEND_MESSAGE, err, payload),
                );
        }
    }

    /**
     * 특정 그룹채팅방의 챗로그를 불러오는 이벤트
     */
    @SubscribeMessage(groupChatPath.SERVER_READ_CHAT_LOGS)
    async readChatLogs(client: Socket, GC_PK: number) {
        if (!client.request.headers['guardPassed']) return;

        try {
            if (!GC_PK) return;

            const payloadStr = client.request.headers['user-payload'];
            const { USER_PK, COMPANY_PK } = parseUserPayloadString(payloadStr);

            const chatLogs = await this.groupChatService.readChatLogs(GC_PK, COMPANY_PK);
            const userMap = await this.groupChatService.getUserInfos(GC_PK, COMPANY_PK, USER_PK);
            this.wss.to(client.id).emit(groupChatPath.CLIENT_READ_CHAT_LOGS, { chatLogs, userMap });
        } catch (err) {
            this.wss
                .to(client.id)
                .emit(
                    groupChatPath.CLIENT_ERROR_ALERT,
                    getSocketErrorPacket(groupChatPath.SERVER_READ_CHAT_LOGS, err, GC_PK),
                );
        }
    }
}
