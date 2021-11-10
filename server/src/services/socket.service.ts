import { Injectable } from '@nestjs/common';
import { SocketRepository, UserRepository, OTOChatRoomRepository } from 'src/mapper';
import { getRepo } from 'src/Helpers/functions';
import { User } from 'src/entity';
import { AikoError } from 'src/Helpers';
import { EntityManager, TransactionManager } from 'typeorm';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';
import { Socket, Server } from 'socket.io';
import { statusPath } from '../interfaces/MVC/socketMVC';
import { InjectModel } from '@nestjs/mongoose';
import { PriavateChatlog, PrivateChatlogDocument } from 'src/schemas/chatlog.schema';
import { Model } from 'mongoose';
import { Status, statusDocument } from 'src/schemas/status.schema';

@Injectable()
export default class SocketService {
    constructor(
        @InjectModel(PriavateChatlog.name) private chatlogModel: Model<PrivateChatlogDocument>,
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
    async makeOneToOneChatRooms(
        @TransactionManager() manager: EntityManager,
        companyPK: number,
        userPK: number,
    ): Promise<boolean> {
        try {
            const userList = await getRepo(UserRepository).getMembers(companyPK);
            return await getRepo(OTOChatRoomRepository).makeOneToOneChatRooms(manager, userPK, userList, companyPK);
        } catch (err) {
            throw new AikoError('testError', 451, 500000);
        }
    }

    async getOneToOneChatRoomList(userId: number, companyPK: number) {
        try {
            return await getRepo(OTOChatRoomRepository).getOneToOneChatRoomList(userId, companyPK);
        } catch (err) {
            throw new AikoError('testError', 451, 500000);
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
            const user = await getRepo(UserRepository).getUserInfoWithUserPK(userPayload.USER_PK);
            const newUserContainer = new Status();
            newUserContainer.userPK = USER_PK;
            newUserContainer.companyPK = COMPANY_PK;
            newUserContainer.socketId = socketId;
            newUserContainer.logoutPending = false;
            newUserContainer.status = !userContainer ? 1 : userContainer.status;

            const isSendable = !userContainer ? true : userContainer.logoutPending;

            await this.setUserStatus(newUserContainer);

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

    async changeStatus(socketId: string, status: number) {
        try {
            const userStatus = await this.getUserStatusWithSocketId(socketId);
            userStatus.status = status;
            await this.setUserStatus(userStatus);
            return { userPK: userStatus.userPK, userStatus: userStatus.status };
        } catch (err) {
            console.error(err);
            if (err instanceof AikoError) throw err;
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

    //
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
            return dto.save();
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

    async getUserStatusWithSocketId(socketId: string) {
        try {
            return (await this.statusModel.findOne({ socketId }).exec()) as Status;
        } catch (err) {
            console.error(err);
            throw new AikoError('socketService/getSocketCont', 100, 5091282);
        }
    }
}
