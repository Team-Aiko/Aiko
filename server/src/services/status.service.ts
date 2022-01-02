import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Server } from 'socket.io';
import { AikoError } from 'src/Helpers';
import { stackAikoError } from 'src/Helpers/functions';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { statusPath } from 'src/interfaces/MVC/socketMVC';
import { Status, StatusDocument } from 'src/schemas/status.schema';
import { StatusClientStorage, StatusClientStorageDocument } from 'src/schemas/statusClientStorage.shcema';

enum statusServiceError {
    generateUserStatus = 1,
    statusConnection = 2,
    statusDisconnect = 3,
    logoutEvent = 4,
    getStatusList = 5,
    changeStatus = 6,
    getUserInfoStatus = 7,
    setUserStatus = 8,
    updateStatus = 9,
    getUserStatus = 10,
    getUserStatusWithSocketId = 11,
    deleteUserStatus = 12,
    insertClientInfo = 13,
    selectClientInfos = 14,
    getClientInfo = 15,
    allDeleteClientInfo = 16,
    deleteOneClientInfo = 17,
    getClientInfoList = 18,
}

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
            status.status = -1;
            await this.setUserStatus(status);
        } catch (err) {
            throw stackAikoError(
                err,
                'StatusService/generateUserStatus',
                500,
                headErrorCode.status + statusServiceError.generateUserStatus,
            );
        }
    }

    async statusConnection(userPK: number, companyPK: number, clientId: string) {
        try {
            const statusInfo = await this.getUserStatus(userPK);
            const statusClientInfoList = await this.getClientInfoList(userPK);

            const statusDTO = new Status();
            statusDTO.userPK = userPK;
            statusDTO.companyPK = companyPK;
            statusDTO.status = statusClientInfoList.length > 0 ? statusDTO.status : 1;

            await this.updateStatus(statusDTO);
            await this.insertClientInfo(userPK, companyPK, clientId);
            const myClients = await this.selectClientInfos(userPK);

            const isSendable = statusClientInfoList.length <= 0;

            return { isSendable, user: statusDTO, myClients };
        } catch (err) {
            throw stackAikoError(
                err,
                'StatusService/statusConnection',
                500,
                headErrorCode.status + statusServiceError.statusConnection,
            );
        }
    }

    async statusDisconnect(clientId: string, wss: Server) {
        console.log('socket/statusDisconnect start');

        try {
            const clientInfo = await this.getClientInfo(clientId);
            if (!clientInfo) return;

            const { userPK } = clientInfo;
            const clientInfoList = await this.getClientInfoList(userPK);

            await this.deleteOneClientInfo(clientId);
            if (clientInfoList.length <= 1) {
                const user = await this.getUserStatus(userPK);
                user.status = -1;

                await this.updateStatus(user);
                wss.to(`company:${user.companyPK}`).emit(statusPath.CLIENT_LOGOUT_ALERT, user);
            }
        } catch (err) {
            throw stackAikoError(
                err,
                'StatusService/statusDisconnect',
                500,
                headErrorCode.status + statusServiceError.statusDisconnect,
            );
        }
    }

    async logoutEvent(userPK: number, companyPK: number, id: string) {
        try {
            await this.allDeleteClientInfo(userPK);
            await this.insertClientInfo(userPK, companyPK, id);
        } catch (err) {
            throw stackAikoError(
                err,
                'StatusService/logoutEvent',
                500,
                headErrorCode.status + statusServiceError.logoutEvent,
            );
        }
    }

    async getStatusList(userPK: number) {
        try {
            const { companyPK } = await this.getUserInfoStatus(userPK);
            return (await this.statusModel.find({ companyPK }).exec()) as Status[];
        } catch (err) {
            throw stackAikoError(
                err,
                'StatusService/getStatusList',
                500,
                headErrorCode.status + statusServiceError.getStatusList,
            );
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
            if (err instanceof AikoError)
                throw stackAikoError(
                    err,
                    'StatusService/changeStatus',
                    500,
                    headErrorCode.status + statusServiceError.changeStatus,
                );
        }
    }

    async getUserInfoStatus(userPK: number) {
        try {
            const userStatus = await this.getUserStatus(userPK);
            return userStatus;
        } catch (err) {
            throw stackAikoError(
                err,
                'StatusService/getUserInfoStatus',
                500,
                headErrorCode.status + statusServiceError.getUserInfoStatus,
            );
        }
    }

    // * util functions

    async setUserStatus(container: Status) {
        console.log('🚀 ~ file: socket.service.ts ~ line 269 ~ SocketService ~ setUserStatus ~ container', container);
        try {
            const dto = new this.statusModel(container);
            return await dto.save();
        } catch (err) {
            throw stackAikoError(
                err,
                'StatusService/setUserStatus',
                500,
                headErrorCode.status + statusServiceError.setUserStatus,
            );
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
                    },
                )
                .exec();
        } catch (err) {
            throw stackAikoError(
                err,
                'StatusService/updateStatus',
                500,
                headErrorCode.status + statusServiceError.updateStatus,
            );
        }
    }

    async getUserStatus(userPK: number) {
        try {
            return (await this.statusModel.findOne({ userPK }).exec()) as Status;
        } catch (err) {
            throw stackAikoError(
                err,
                'StatusService/getUserStatus',
                500,
                headErrorCode.status + statusServiceError.getUserStatus,
            );
        }
    }

    async getUserStatusWithSocketId(socketId: string) {
        try {
            return (await this.statusModel.findOne({ socketId })) as Status;
        } catch (err) {
            throw stackAikoError(
                err,
                'StatusService/getUserStatusWithSocketId',
                500,
                headErrorCode.status + statusServiceError.getUserStatusWithSocketId,
            );
        }
    }

    async deleteUserStatus(userPK: number) {
        try {
            return await this.statusModel.findOneAndRemove({ userPK }).exec();
        } catch (err) {
            throw stackAikoError(
                err,
                'StatusService/deleteUserStatus',
                500,
                headErrorCode.status + statusServiceError.deleteUserStatus,
            );
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
            throw stackAikoError(
                err,
                'StatusService/insertClientInfo',
                500,
                headErrorCode.status + statusServiceError.insertClientInfo,
            );
        }
    }

    async selectClientInfos(userPK: number) {
        try {
            return (await this.statusClientStorageModel.find({ userPK })) as StatusClientStorage[];
        } catch (err) {
            throw stackAikoError(
                err,
                'StatusService/selectClientInfos',
                500,
                headErrorCode.status + statusServiceError.selectClientInfos,
            );
        }
    }

    async getClientInfo(clientId: string) {
        try {
            return (await this.statusClientStorageModel.findOne({ clientId })) as StatusClientStorage;
        } catch (err) {
            throw stackAikoError(
                err,
                'StatusService/getClientInfo',
                500,
                headErrorCode.status + statusServiceError.getClientInfo,
            );
        }
    }

    async getClientInfoList(userPK: number) {
        try {
            return (await this.statusClientStorageModel
                .find()
                .where('userPK')
                .equals(userPK)
                .select('userPK companyPK clientId')) as StatusClientStorage[];
        } catch (err) {
            throw stackAikoError(
                err,
                'StatusService/getClientInfoList',
                500,
                headErrorCode.status + statusServiceError.getClientInfoList,
            );
        }
    }

    async allDeleteClientInfo(userPK: number) {
        console.log('🚀 ~ file: status.service.ts ~ line 251 ~ StatusService ~ allDeleteClientInfo ~ userPK', userPK);

        try {
            await this.statusClientStorageModel.deleteMany({ userPK }).exec();
        } catch (err) {
            throw stackAikoError(
                err,
                'StatusService/allDeleteClientInfo',
                500,
                headErrorCode.status + statusServiceError.allDeleteClientInfo,
            );
        }
    }

    async deleteOneClientInfo(clientId: string) {
        try {
            await this.statusClientStorageModel.deleteOne({ clientId }).exec();
        } catch (err) {
            throw stackAikoError(
                err,
                'StatusService/deleteOneClientInfo',
                500,
                headErrorCode.status + statusServiceError.deleteOneClientInfo,
            );
        }
    }
}
