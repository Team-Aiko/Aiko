import { Injectable } from '@nestjs/common';
import { SocketRepository, UserRepository } from 'src/mapper';
import { getRepo } from 'src/Helpers/functions';
import { PrivateChatRoom, User } from 'src/entity';
import { AikoError } from 'src/Helpers';
import { EntityManager, TransactionManager } from 'typeorm';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';
import { Socket, Server } from 'socket.io';
import { IMessagePayload, statusPath } from '../interfaces/MVC/socketMVC';
import { InjectModel } from '@nestjs/mongoose';
import { PrivateChatlog, PrivateChatlogDocument } from 'src/schemas/chatlog.schema';
import { Model } from 'mongoose';
import { Status, statusDocument } from 'src/schemas/status.schema';
import PrivateChatRoomRepository from 'src/mapper/privateChatRoom.repository';

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
     * status connection 실시메소드, setOnline과 별개로 필요한 과정.
     * @param socketId
     * @param userPayload
     * @returns
     */
    async statusConnection(socketId: string, userPayload: IUserPayload): Promise<{ isSendable: boolean; user?: User }> {
        const { USER_PK, COMPANY_PK } = userPayload;

        try {
            const userContainer = await this.getUserStatus(COMPANY_PK, USER_PK);
            console.log(
                '🚀 ~ file: socket.service.ts ~ line 93 ~ SocketService ~ statusConnection ~ userContainer',
                userContainer,
            );
            const user = await getRepo(UserRepository).getUserInfoWithUserPK(userPayload.USER_PK);
            const newUserContainer = new Status();
            newUserContainer.userPK = USER_PK;
            newUserContainer.companyPK = COMPANY_PK;
            newUserContainer.socketId = socketId;
            newUserContainer.logoutPending = false;
            newUserContainer.status = !userContainer ? 1 : userContainer.status;

            const isSendable = !userContainer ? true : userContainer.logoutPending;

            if (userContainer) await this.updateStatus(newUserContainer);
            else await this.setUserStatus(newUserContainer);

            return { isSendable, user: isSendable ? user : undefined };
        } catch (err) {
            if (err instanceof AikoError) throw err;
            else throw new AikoError('socketService/statusConnection', 100, 1);
        }
    }

    /**
     * status disconnect를 시행하는 메소드, 5분의 유예기간을 줌
     * @param socketId
     */
    async statusDisconnect(socketClient: Socket, wss: Server) {
        console.log('socket/statusDisconnect start');

        try {
            const userStatus = await this.getUserStatusWithSocketId(socketClient.id);
            if (userStatus?.userPK) {
                setTimeout(async () => {
                    // delete process
                    console.log('delete process executed');
                    if (userStatus.logoutPending) {
                        await this.deleteUserStatus(userStatus.companyPK, userStatus.userPK);
                        wss.to(`${userStatus.companyPK}`)
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

    /**
     * 로그인 시 status를 온라인으로 추가하는 메소드
     * @param user
     */
    async setOnline(user: User) {
        try {
            const { USER_PK, COMPANY_PK } = user;
            this.setUserStatus({
                userPK: USER_PK,
                companyPK: COMPANY_PK,
                socketId: '',
                logoutPending: false,
                status: 1,
            });
        } catch (err) {
            console.error(err);
            if (err instanceof AikoError) throw err;
            else throw new AikoError('socketService/setOnline', 500, 500594);
        }
    }

    async changeStatus(socketId: string, status: { userPK: number; userStatus: number }) {
        console.log('🚀 ~ file: socket.service.ts ~ line 175 ~ SocketService ~ changeStatus ~ status', status);
        try {
            const userStatus = await this.getUserStatusWithSocketId(socketId);
            userStatus.status = status.userStatus;
            const temp = await this.updateStatus(userStatus);
            console.log('🚀 ~ file: socket.service.ts ~ line 178 ~ SocketService ~ changeStatus ~ temp', temp);
            return { userPK: userStatus.userPK, userStatus: userStatus.status };
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
                    { status: userStatus.status, socketId: userStatus.socketId },
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
