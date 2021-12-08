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
import { getRepo } from 'src/Helpers';
import { groupChatPath } from 'src/interfaces/MVC/socketMVC';
import { UserRepository } from 'src/mapper';
import { GroupChatClientInfo } from 'src/schemas/groupChatClientInfo.schema';
import GroupChatService from 'src/services/groupChat.service';

@UseGuards(UserGuard)
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
     * 자신이 속한 그룹챗방 리스트를 클라이언트로 보낸다.
     * @param client
     * @param userInfo
     * @returns
     */
    @SubscribeMessage(groupChatPath.HANDLE_CONNECTION)
    async handleConnection(client: Socket, userInfo: User) {
        try {
            if (!client) return;

            console.log('groupChat connection clientId : ', client.id);
            const clientInfo = await this.groupChatService.addClientForGroupChat(client.id, userInfo);
            const groupChatRooms = await this.groupChatService.findChatRooms(userInfo);

            this.wss.to(client.id).emit(groupChatPath.CLIENT_CONNECTED, groupChatRooms);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * 소켓 연결을 해제하는 이벤트
     * @returns
     */
    @SubscribeMessage(groupChatPath.HANDLE_DISCONNECT)
    async handleDisconnect(client: Socket) {
        try {
            if (!client) return;

            console.log('groupChat disconnect clientId : ', client.id);
        } catch (err) {
            console.error(err);
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
        }: { userList: number[]; admin: number; roomTitle: string; maxNum: number },
    ) {
        try {
            if (!client) return;

            console.log('createGroupChatRoom clientId : ', client.id);
            const { GC_PK, memberList, COMPANY_PK } = await this.groupChatService.createGroupChatRoom({
                userList,
                admin,
                roomTitle,
                maxNum,
            });

            memberList.forEach((member) => {
                this.wss.to(member.clientId).emit(groupChatPath.CLIENT_JOIN_ROOM_NOTICE, { GC_PK, memberList });
            });
        } catch (err) {
            console.error(err);
        }
    }

    @SubscribeMessage(groupChatPath.SERVER_JOIN_GROUP_CHAT_ROOM)
    async joinGroupChatRoom(client: Socket, { GC_PK, userPK }: { GC_PK: number; userPK: number }) {
        try {
            if (!client) return;

            const { COMPANY_PK } = await getRepo(UserRepository).getUserInfoWithUserPK(userPK);

            // 해당 채팅룸에 조인하는 프로세스
            client.join(`company:${COMPANY_PK}-${GC_PK}`);
            // 조인이 완료됨을 보냄.
            this.wss.to(client.id).emit(groupChatPath.CLIENT_JOINED_GCR, true);
        } catch (err) {
            console.error(err);
        }
    }

    @SubscribeMessage(groupChatPath.SERVER_SEND_MESSAGE)
    async sendMessageToGroup(
        client: Socket,
        payload: { GC_PK: number; sender: number; file: number; message: string },
    ) {
        try {
            if (!client) return;

            await this.groupChatService.sendMessageToGroup(payload, this.wss);
        } catch (err) {
            console.error(err);
        }
    }

    // * test reactors
    @SubscribeMessage(groupChatPath.TEST_ADD_NEW_CLIENT)
    async addNewClientForGroupChat(client: Socket, userPK: number) {
        try {
            if (!client) return;

            this.groupChatService.addNewClientForGroupChat(userPK);
        } catch (err) {
            console.error(err);
        }
    }
}
