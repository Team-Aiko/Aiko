import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Socket, Server } from 'socket.io';
import { AikoError, getRepo } from 'src/Helpers';
import { tokenParser } from 'src/Helpers/functions';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';
import { statusPath } from 'src/interfaces/MVC/socketMVC';
import { UserRepository } from 'src/mapper';
import { Status, StatusDocument } from 'src/schemas/status.schema';
import { StatusClientStorage, StatusClientStorageDocument } from 'src/schemas/statusClientStorage.shcema';

@Injectable()
export default class StatusService {
    constructor(
        @InjectModel(Status.name) private statusModel: Model<StatusDocument>,
        @InjectModel(StatusClientStorage.name) private statusClientStorageModel: Model<StatusClientStorageDocument>,
    ) {}

    async generateUserStatus(userPK: number, companyPK: number) {
        try {
            const status = new Status();
            status.companyPK = companyPK;
            status.userPK = userPK;
            status.logoutPending = false;
            status.status = -1;
            await this.setUserStatus(status);
        } catch (err) {
            console.error(err);
            throw new AikoError('socketService/generateUserStatus', 100, 193948);
        }
    }

    async statusConnection(
        accessToken: string,
        clientId: string,
    ): Promise<{ isSendable: boolean; user?: Status; myClients: StatusClientStorage[] }> {
        const { USER_PK, COMPANY_PK } = tokenParser(accessToken);

        try {
            const statusInfo = await this.getUserStatus(USER_PK);
            console.log(
                '🚀 ~ file: socket.service.ts ~ line 93 ~ SocketService ~ statusConnection ~ statusInfo',
                statusInfo,
            );
            const statusDTO = new Status();
            statusDTO.userPK = USER_PK;
            statusDTO.companyPK = COMPANY_PK;
            statusDTO.logoutPending = false;
            statusDTO.status = !statusInfo ? 1 : statusInfo.status === -1 ? 1 : statusInfo.status;

            await this.updateStatus(statusDTO);
            await this.insertClientInfo(USER_PK, COMPANY_PK, clientId);
            const myClients = await this.selectClientInfos(USER_PK);

            const isSendable = !statusInfo.logoutPending;

            return { isSendable, user: statusDTO, myClients };
        } catch (err) {
            if (err instanceof AikoError) throw err;
            else throw new AikoError('socketService/statusConnection', 100, 1);
        }
    }

    async statusDisconnect(clientId: string, wss: Server) {
        console.log('socket/statusDisconnect start');

        try {
            const clientInfo = await this.getClientInfo(clientId);

            if (clientInfo) {
                const { userPK } = clientInfo;
                const statusInfo = await this.getUserStatus(userPK);

                setTimeout(async () => {
                    // delete process
                    console.log('logout process executed');
                    const user = await this.getUserStatus(userPK);

                    console.log(
                        '🚀 ~ file: socket.service.ts ~ line 191 ~ SocketService ~ setTimeout ~ userStatus',
                        user,
                    );

                    if (user?.logoutPending) {
                        console.log('안됨???');
                        user.status = -1;
                        user.logoutPending = false;

                        await this.updateStatus(user);
                        wss.to(`company:${user.companyPK}`).emit(statusPath.CLIENT_LOGOUT_ALERT, user);
                    }
                }, 1000 * 10); // 5분간격

                await this.updateStatus({
                    userPK: statusInfo.userPK,
                    companyPK: statusInfo.companyPK,
                    logoutPending: true,
                    status: statusInfo.status,
                });
            } else {
                await this.deleteOneClientInfo(clientId);
            }
        } catch (err) {
            throw err;
        }
    }

    async getStatusList(userPK: number) {
        try {
            const { companyPK } = await this.getUserInfoStatus(userPK);
            return (await this.statusModel.find({ companyPK }).exec()) as Status[];
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async changeStatus(clientId: string, stat: number) {
        try {
            const { userPK } = await this.getClientInfo(clientId);
            const userStatus = await this.getUserStatus(userPK);

            userStatus.status = stat;
            await this.updateStatus(userStatus);

            return userStatus;
        } catch (err) {
            console.error(err);
            if (err instanceof AikoError) throw err;
        }
    }

    async getUserInfoStatus(userPK: number) {
        try {
            const userStatus = await this.getUserStatus(userPK);
            return userStatus;
        } catch (err) {
            console.error(err);
            throw new AikoError('socketService/getUserInfoStatus', 0, 4);
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
                        logoutPending: userStatus.logoutPending,
                    },
                )
                .exec();
        } catch (err) {
            console.error(err);
            throw new AikoError('socket/Service/updateStatus', 100, 2039483);
        }
    }

    async getUserStatus(userPK: number) {
        try {
            return (await this.statusModel.findOne({ userPK }).exec()) as Status;
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

    async insertClientInfo(userPK: number, companyPK: number, clientId: string) {
        try {
            const pac = new StatusClientStorage();
            pac.clientId = clientId;
            pac.companyPK = companyPK;
            pac.userPK = userPK;

            const dto = new this.statusClientStorageModel(pac);
            await dto.save();
        } catch (err) {
            console.error(err);
            throw new AikoError('statusService/insertClientInfo', 100, 2971892);
        }
    }

    async selectClientInfos(userPK: number) {
        try {
            return (await this.statusClientStorageModel.find({ userPK })) as StatusClientStorage[];
        } catch (err) {
            console.error(err);
            throw new AikoError('statusService/selectClientInfos', 100, 291829);
        }
    }

    async getClientInfo(clientId: string) {
        try {
            return (await this.statusClientStorageModel.findOne({ clientId })) as StatusClientStorage;
        } catch (err) {
            console.error(err);
            throw new AikoError('statusService/getClientInfo', 100, 12939021);
        }
    }

    async allDeleteClientInfo(userPK: number) {
        try {
            await this.statusClientStorageModel.deleteMany({ userPK }).exec();
        } catch (err) {
            console.error(err);
            throw new AikoError('statusService/allDeleteClientInfo', 100, 12939031);
        }
    }

    async deleteOneClientInfo(clientId: string) {
        try {
            await this.statusClientStorageModel.deleteOne({ clientId }).exec();
        } catch (err) {
            console.error(err);
            throw new AikoError('statusService/deleteOneClientInfo', 100, 12939032);
        }
    }
}
