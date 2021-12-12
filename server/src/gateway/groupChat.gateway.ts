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
import { User } from 'src/entity';
import { UserGuard } from 'src/guard/user.guard';
import { AikoError, getRepo } from 'src/Helpers';
import { getSocketErrorPacket, tokenParser } from 'src/Helpers/functions';
import { groupChatPath, IErrorPacket } from 'src/interfaces/MVC/socketMVC';
import { UserRepository } from 'src/mapper';
import { GroupChatClientInfo } from 'src/schemas/groupChatClientInfo.schema';
import GroupChatService from 'src/services/groupChat.service';

@WebSocketGateway({ cors: true, namespace: 'group-chat' })
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
    async handleConnection(client: Socket, accessToken: string) {
        try {
            if (!accessToken) return;

            const userPayload = tokenParser(accessToken);

            console.log('groupChat connection clientId : ', client.id);
            const clientInfo = await this.groupChatService.addClientForGroupChat(client.id, userPayload);
            const groupChatRooms = await this.groupChatService.findChatRooms(userPayload);

            groupChatRooms.forEach(({ GC_PK }) => {
                client.join(`company:${userPayload.COMPANY_PK}-${GC_PK}`);
            });

            this.wss.to(client.id).emit(groupChatPath.CLIENT_CONNECTED, groupChatRooms);
        } catch (err) {
            this.wss
                .to(client.id)
                .emit(
                    groupChatPath.CLIENT_ERROR_ALERT,
                    getSocketErrorPacket(groupChatPath.CLIENT_ERROR_ALERT, err, accessToken),
                );
        }
    }

    /**
     * 소켓 연결을 해제하는 이벤트
     * @returns
     */
    @SubscribeMessage(groupChatPath.HANDLE_DISCONNECT)
    async handleDisconnect(client: Socket) {
        try {
            console.log('groupChat disconnect clientId : ', client.id);
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
    @SubscribeMessage(groupChatPath.CREATE_GROUP_CHAT_ROOM)
    async createGroupChatRoom(
        client: Socket,
        {
            userList,
            admin,
            roomTitle,
            maxNum,
            accessToken,
        }: { userList: number[]; admin: number; roomTitle: string; maxNum: number; accessToken: string },
    ) {
        try {
            if (!admin) return;

            console.log('createGroupChatRoom clientId : ', client.id);
            const { GC_PK, memberList, COMPANY_PK } = await this.groupChatService.createGroupChatRoom({
                userList,
                admin,
                roomTitle,
                maxNum,
                accessToken,
            });

            memberList.forEach((member) => {
                this.wss.to(member.clientId).emit(groupChatPath.CLIENT_JOIN_ROOM_NOTICE, {
                    GC_PK,
                    memberList,
                    admin,
                    roomTitle,
                    maxNum,
                });
            });
        } catch (err) {
            this.wss.to(client.id).emit(
                groupChatPath.CLIENT_ERROR_ALERT,
                getSocketErrorPacket(groupChatPath.CREATE_GROUP_CHAT_ROOM, err, {
                    userList,
                    admin,
                    roomTitle,
                    maxNum,
                    accessToken,
                }),
            );
        }
    }

    /**
     * 새로 생성된 방에 추가로 조인하는 이벤트
     */
    @SubscribeMessage(groupChatPath.SERVER_JOIN_GROUP_CHAT_ROOM)
    async joinGroupChatRoom(client: Socket, { GC_PK, accessToken }: { GC_PK: number; accessToken: string }) {
        try {
            if (!GC_PK) return;
            const { COMPANY_PK } = tokenParser(accessToken);

            // 해당 채팅룸에 조인하는 프로세스
            client.join(`company:${COMPANY_PK}-${GC_PK}`);
            // 조인이 완료됨을 보냄.
            this.wss.to(client.id).emit(groupChatPath.CLIENT_JOINED_GCR, true);
        } catch (err) {
            this.wss
                .to(client.id)
                .emit(
                    groupChatPath.CLIENT_ERROR_ALERT,
                    getSocketErrorPacket(groupChatPath.SERVER_JOIN_GROUP_CHAT_ROOM, err, { GC_PK, accessToken }),
                );
        }
    }

    /**
     * 특정 그룹챗방에 메세지를 보내는 이벤트
     */
    @SubscribeMessage(groupChatPath.SERVER_SEND_MESSAGE)
    async sendMessageToGroup(
        client: Socket,
        payload: { GC_PK: number; accessToken: string; file: number; message: string },
    ) {
        try {
            if (!payload) return;

            await this.groupChatService.sendMessageToGroup(payload, this.wss);
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
    async readChatLogs(client: Socket, payload: { GC_PK: number; accessToken: string }) {
        try {
            if (!payload) return;
            const { COMPANY_PK } = tokenParser(payload.accessToken);

            const chatLogs = await this.groupChatService.readChatLogs(payload.GC_PK, COMPANY_PK);
            this.wss.to(client.id).emit(groupChatPath.CLIENT_READ_CHAT_LOGS, chatLogs);
        } catch (err) {
            this.wss
                .to(client.id)
                .emit(
                    groupChatPath.CLIENT_ERROR_ALERT,
                    getSocketErrorPacket(groupChatPath.SERVER_READ_CHAT_LOGS, err, payload),
                );
        }
    }

    // * test reactors
    @SubscribeMessage(groupChatPath.TEST_ADD_NEW_CLIENT)
    async addNewClientForGroupChat(client: Socket, userPK: number) {
        try {
            if (!userPK) return;

            this.groupChatService.addNewClientForGroupChat(userPK);
        } catch (err) {
            this.wss
                .to(client.id)
                .emit(
                    groupChatPath.CLIENT_ERROR_ALERT,
                    getSocketErrorPacket(groupChatPath.TEST_ADD_NEW_CLIENT, err, userPK),
                );
        }
    }
}
