import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Socket, Server } from 'socket.io';
import { AikoError, getRepo } from 'src/Helpers';
import { tokenParser } from 'src/Helpers/functions';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';
import { statusPath } from 'src/interfaces/MVC/socketMVC';
import { UserRepository } from 'src/mapper';
import { Status, statusDocument } from 'src/schemas/status.schema';

@Injectable()
export default class StatusService {
    constructor(@InjectModel(Status.name) private statusModel: Model<statusDocument>) {}

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

    async statusConnection(socketId: string, accessToken: string): Promise<{ isSendable: boolean; user?: Status }> {
        const { USER_PK, COMPANY_PK } = tokenParser(accessToken);

        try {
            const userContainer = await this.getUserStatus(COMPANY_PK, USER_PK);
            console.log(
                '🚀 ~ file: socket.service.ts ~ line 93 ~ SocketService ~ statusConnection ~ userContainer',
                userContainer,
            );
            const newUserContainer = new Status();
            newUserContainer.userPK = USER_PK;
            newUserContainer.companyPK = COMPANY_PK;
            newUserContainer.socketId = socketId;
            newUserContainer.logoutPending = false;
            newUserContainer.status = !userContainer ? 1 : userContainer.status === -1 ? 1 : userContainer.status;

            await this.updateStatus(newUserContainer);

            const isSendable = !userContainer.logoutPending;

            return { isSendable, user: newUserContainer };
        } catch (err) {
            if (err instanceof AikoError) throw err;
            else throw new AikoError('socketService/statusConnection', 100, 1);
        }
    }

    async statusDisconnect(socketClient: Socket, wss: Server) {
        console.log('socket/statusDisconnect start');

        try {
            const userStatus = await this.getUserStatusWithSocketId(socketClient.id);
            // early case split
            if (!userStatus) return;

            setTimeout(async () => {
                // delete process
                console.log('logout process executed');
                const user = await this.getUserStatusWithSocketId(socketClient.id);

                console.log('🚀 ~ file: socket.service.ts ~ line 191 ~ SocketService ~ setTimeout ~ userStatus', user);

                if (user?.logoutPending) {
                    console.log('안됨???');
                    user.status = -1;
                    user.logoutPending = false;

                    await this.updateStatus(user);
                    wss.to(`company:${user.companyPK}`)
                        .except(socketClient.id)
                        .emit(statusPath.CLIENT_LOGOUT_ALERT, user);
                }
            }, 1000 * 10); // 5분간격

            await this.updateStatus({
                userPK: userStatus.userPK,
                companyPK: userStatus.companyPK,
                socketId: socketClient.id,
                logoutPending: true,
                status: userStatus.status,
            });
        } catch (err) {
            console.error(err);
            if (err instanceof AikoError) throw err;
            else throw new AikoError('socketService/statusDisconnect', 100, 2);
        }
    }

    async getStatusList(clientId: string) {
        try {
            const { companyPK } = await this.getUserInfoStatus(clientId);
            return (await this.statusModel.find({ companyPK }).exec()) as Status[];
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async changeStatus(socketId: string, stat: number) {
        console.log('🚀 ~ file: socket.service.ts ~ line 175 ~ SocketService ~ changeStatus ~ status', status);
        try {
            const userStatus = await this.getUserStatusWithSocketId(socketId);
            console.log('🚀 ~ file: socket.service.ts ~ line 219 ~ SocketService ~ changeStatus ~ socketId', socketId);
            console.log(
                '🚀 ~ file: socket.service.ts ~ line 219 ~ SocketService ~ changeStatus ~ userStatus',
                userStatus,
            );
            userStatus.status = stat;
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

    // * util functions

    async setUserStatus(container: Status) {
        console.log('🚀 ~ file: socket.service.ts ~ line 269 ~ SocketService ~ setUserStatus ~ container', container);
        try {
            const dto = new this.statusModel(container);
            return await dto.save();
        } catch (err) {
            console.error(err);
            throw new AikoError('socketService/setUsrCont', 100, 5091282);
        }
    }

    async updateStatus(userStatus: Status) {
        console.log('🚀 ~ file: socket.service.ts ~ line 298 ~ SocketService ~ updateStatus ~ userStatus', userStatus);
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

    async getUserStatus(companyPK: number, userPK: number) {
        try {
            return (await this.statusModel.findOne({ userPK, companyPK }).exec()) as Status;
        } catch (err) {
            console.error(err);
            throw new AikoError('socketService/getUsrCont', 100, 5091282);
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

    async deleteUserStatus(userPK: number) {
        try {
            return await this.statusModel.findOneAndRemove({ userPK }).exec();
        } catch (err) {
            console.error(err);
            throw new AikoError('socketService', 100, 5028123);
        }
    }
}
