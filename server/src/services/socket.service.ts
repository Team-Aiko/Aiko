import { Injectable } from '@nestjs/common';
import { GroupChatRoomRepository, SocketRepository, UserRepository } from 'src/mapper';
import { getRepo } from 'src/Helpers/functions';
import { PrivateChatRoom, User } from 'src/entity';
import { AikoError } from 'src/Helpers';
import { EntityManager, getConnection, TransactionManager } from 'typeorm';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';
import { Socket, Server } from 'socket.io';
import { IMessagePayload, statusPath } from '../interfaces/MVC/socketMVC';
import { InjectModel } from '@nestjs/mongoose';
import { PrivateChatlog, PrivateChatlogDocument } from 'src/schemas/chatlog.schema';
import { Model } from 'mongoose';
import { Status, statusDocument } from 'src/schemas/status.schema';
import PrivateChatRoomRepository from 'src/mapper/privateChatRoom.repository';
import GroupChatUserListRepository from 'src/mapper/groupChatUserList.entity';

@Injectable()
export default class SocketService {
    constructor(
        @InjectModel(PrivateChatlog.name) private chatlogModel: Model<PrivateChatlogDocument>,
        @InjectModel(Status.name) private statusModel: Model<statusDocument>,
    ) {}
    /**
     *
     *
     *
     *
     *
     *
     *     * rdbms - socket service
     *
     *
     *
     *
     *
     *
     */

    /**
     * 회원가입 승인이 떨어질 시, 사원간 챗룸 생성.
     * @param userInfo
     * @returns
     */
    async makePrivateChatRoomList(
        @TransactionManager() manager: EntityManager,
        companyPK: number,
        userPK: number,
    ): Promise<boolean> {
        try {
            const userList = await getRepo(UserRepository).getMembers(companyPK);
            await getRepo(PrivateChatRoomRepository).makePrivateChatRoomList(manager, userPK, userList, companyPK);

            const roomList = await getRepo(PrivateChatRoomRepository).getPrivateChatRoomList(userPK, companyPK);

            await Promise.all(
                roomList.map(async (room) => {
                    const dto = new PrivateChatlog();
                    dto.roomId = room.CR_PK;
                    dto.messages = [];
                    await this.chatlogModel.create(dto);

                    return true;
                }),
            );

            return true;
        } catch (err) {
            throw new AikoError('testError', 451, 500000);
        }
    }

    async generateUserStatus(userPK: number, companyPK: number) {
        try {
            const status = new Status();
            status.companyPK = companyPK;
            status.userPK = userPK;
            status.socketId = 'initialized';
            status.logoutPending = false;
            status.status = -1;
            await this.setUserStatus(status);
        } catch (err) {
            console.error(err);
            throw new AikoError('socketService/generateUserStatus', 100, 193948);
        }
    }

    /**
     *
     *
     * private chat methods
     *
     *
     */

    async connectPrivateChat(socketId: string, { userPK, companyPK }: { userPK: number; companyPK: number }) {
        try {
            const user = await getRepo(UserRepository).getUserInfoWithUserPK(userPK);

            if (user.COMPANY_PK !== companyPK || user.USER_PK !== userPK)
                throw new AikoError('socketService/invalid user information', 100, 49921);

            const roomList = await getRepo(PrivateChatRoomRepository).getPrivateChatRoomList(
                user.USER_PK,
                user.COMPANY_PK,
            );

            return roomList;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async sendMessage(payload: IMessagePayload) {
        try {
            await this.updateChatlog(payload);
        } catch (err) {
            throw err;
        }
    }

    /**
     *
     *
     *
     *
     *
     *
     *
     *
     * * status service
     *
     *
     *
     *
     *
     *
     *
     */

    /**
     * status connection 실시메소드
     * @param socketId
     * @param userPayload
     * @returns
     */
    async statusConnection(
        socketId: string,
        userPayload: IUserPayload,
    ): Promise<{ isSendable: boolean; user?: Status }> {
        const { USER_PK, COMPANY_PK } = userPayload;

        try {
            const userContainer = await this.getUserStatus(COMPANY_PK, USER_PK);
            console.log(
                '🚀 ~ file: socket.service.ts ~ line 93 ~ SocketService ~ statusConnection ~ userContainer',
                userContainer,
            );
            const user = await getRepo(UserRepository).getUserInfoWithUserPK(userPayload.USER_PK);
            const newUserContainer = new Status();
            newUserContainer.userPK = user.USER_PK;
            newUserContainer.companyPK = user.COMPANY_PK;
            newUserContainer.socketId = socketId;
            newUserContainer.logoutPending = false;
            newUserContainer.status = !userContainer ? 1 : userContainer.status;

            await this.updateStatus(newUserContainer);

            const isSendable = userContainer.logoutPending;

            return { isSendable, user: newUserContainer };
        } catch (err) {
            if (err instanceof AikoError) throw err;
            else throw new AikoError('socketService/statusConnection', 100, 1);
        }
    }

    /**
     * status disconnect를 시행하는 메소드, 5분의 유예기간을 줌
     */
    async statusDisconnect(socketClient: Socket, wss: Server) {
        console.log('socket/statusDisconnect start');

        try {
            const userStatus = await this.getUserStatusWithSocketId(socketClient.id);
            if (userStatus?.userPK) {
                setTimeout(async () => {
                    // delete process
                    console.log('logout process executed');
                    if (userStatus.logoutPending) {
                        userStatus.status = -1;
                        userStatus.logoutPending = false;

                        await this.updateStatus(userStatus);
                        wss.to(`company:${userStatus.companyPK}`)
                            .except(socketClient.id)
                            .emit(statusPath.CLIENT_LOGOUT_ALERT, userStatus);
                    }
                }, 1000 * 60 * 5); // 5분간격

                await this.setUserStatus({
                    userPK: userStatus.userPK,
                    companyPK: userStatus.companyPK,
                    socketId: socketClient.id,
                    logoutPending: true,
                    status: userStatus.status,
                });
            }
        } catch (err) {
            console.error(err);
            if (err instanceof AikoError) throw err;
            else throw new AikoError('socketService/statusDisconnect', 100, 2);
        }
    }

    async changeStatus(socketId: string, status: { userPK: number; userStatus: number }) {
        console.log('🚀 ~ file: socket.service.ts ~ line 175 ~ SocketService ~ changeStatus ~ status', status);
        try {
            const userStatus = await this.getUserStatusWithSocketId(socketId);
            userStatus.status = status.userStatus;
            await this.updateStatus(userStatus);

            return userStatus;
        } catch (err) {
            console.error(err);
            if (err instanceof AikoError) throw err;
        }
    }

    async getUserInfoStatus(socketId: string) {
        try {
            const userStatus = await this.getUserStatusWithSocketId(socketId);
            return userStatus;
        } catch (err) {
            console.error(err);
            throw new AikoError('socketService/getUserInfoStataus', 0, 4);
        }
    }

    // * group chat methods
    async createGroupChatRoom({
        userList,
        admin,
        roomTitle,
        maxNum,
    }: {
        userList: number[];
        admin: number;
        roomTitle: string;
        maxNum: number;
    }) {
        try {
            const queryRunner = getConnection().createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();

            await getRepo(GroupChatRoomRepository).createGroupChatRoom(admin, roomTitle, maxNum, queryRunner.manager);
            await getRepo(GroupChatUserListRepository);
        } catch (err) {
            throw err;
        }
    }

    /**
     *
     *
     *
     *
     *
     *
     *
     *
     * * util functions (status)
     *
     *
     *
     *
     *
     *
     *
     */
    async getUserStatus(companyPK: number, userPK: number) {
        try {
            return (await this.statusModel.findOne({ userPK, companyPK }).exec()) as Status;
        } catch (err) {
            console.error(err);
            throw new AikoError('socketService/getUsrCont', 100, 5091282);
        }
    }

    async setUserStatus(container: Status) {
        console.log('🚀 ~ file: socket.service.ts ~ line 269 ~ SocketService ~ setUserStatus ~ container', container);
        try {
            const dto = new this.statusModel(container);
            this.statusModel.create(container);
            return await dto.save();
        } catch (err) {
            console.error(err);
            throw new AikoError('socketService/setUsrCont', 100, 5091282);
        }
    }

    async deleteUserStatus(companyPK: number, userPK: number) {
        try {
            return await this.statusModel.deleteOne({ companyPK, userPK }).exec();
        } catch (err) {
            console.error(err);
            throw new AikoError('socketService/delUsrCont', 100, 5091282);
        }
    }

    async updateStatus(userStatus: Status) {
        try {
            return await this.statusModel
                .findOneAndUpdate(
                    { userPK: userStatus.userPK, companyPK: userStatus.companyPK },
                    {
                        status: userStatus.status,
                        socketId: userStatus.socketId,
                        logoutPending: userStatus.logoutPending,
                    },
                )
                .exec();
        } catch (err) {
            console.error(err);
            throw new AikoError('socket/Service/updateStatus', 100, 2039483);
        }
    }

    async getUserStatusWithSocketId(socketId: string) {
        try {
            return (await this.statusModel.findOne({ socketId })) as Status;
        } catch (err) {
            console.error(err);
            throw new AikoError('socketService/getSocketCont', 100, 5091282);
        }
    }

    /**
     *
     *
     *
     *
     *
     *
     *
     *
     * * util functions (private chat)
     *
     *
     *
     *
     *
     *
     *
     */

    async updateChatlog({ date, message, roomId, sender, file }: IMessagePayload) {
        try {
            const chatlog = await this.chatlogModel.findOne({ roomId });
            chatlog.messages.push({
                sender,
                file: file || -1,
                date,
                message: message || '',
            });

            await this.chatlogModel.findOneAndUpdate({ roomId }, chatlog).exec();
        } catch (err) {
            console.error(err);
        }
    }

    async getChalog(roomId: string) {
        try {
            return (await this.chatlogModel.findOne({ roomId })) as PrivateChatlog;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}
