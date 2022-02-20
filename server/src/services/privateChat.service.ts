import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getServerTime, stackAikoError } from 'src/Helpers/functions';
import { getRepo } from 'src/Helpers';
import { IMessagePayload } from 'src/interfaces/MVC/socketMVC';
import { CompanyRepository, PrivateChatRoomRepository, UserRepository } from 'src/mapper';
import ChatLogStorageRepository from 'src/mapper/chatLogStorage.repository';
import { PrivateChatlog, PrivateChatlogDocument } from 'src/schemas/chatlog.schema';
import { EntityManager, TransactionManager } from 'typeorm';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { User } from 'src/entity';
import StatusService from './status.service';
import { PrivateChatClientInfo, PrivateChatClientInfoDocument } from 'src/schemas/privateChatClientInfo.schema';

enum privateChatServiceError {
    makePrivateChatRoomList = 1,
    connectPrivateChat = 2,
    sendMessage = 3,
    getChalog = 4,
    getUserInfo = 5,
    updateChatlog = 6,
    storePrivateChatLogsToRDB = 7,
    addClient = 8,
    getClientInfo = 9,
}

@Injectable()
export default class PrivateChatService {
    constructor(
        @InjectModel(PrivateChatlog.name) private chatlogModel: Model<PrivateChatlogDocument>,
        @InjectModel(PrivateChatClientInfo.name)
        private privateClientStorageModel: Model<PrivateChatClientInfoDocument>,
        private statusService: StatusService,
    ) {}

    async makePrivateChatRoomList(
        @TransactionManager() manager: EntityManager,
        companyPK: number,
        userPK: number,
    ): Promise<boolean> {
        try {
            const userList = await getRepo(UserRepository).getMembers(companyPK);
            const roomList = await getRepo(PrivateChatRoomRepository).makePrivateChatRoomList(
                manager,
                userPK,
                userList,
                companyPK,
            );

            await Promise.all(
                roomList.map(async (id) => {
                    const item = new PrivateChatlog();
                    item.roomId = id;
                    item.messages = [];
                    console.log(
                        '🚀 ~ file: privateChat.service.ts ~ line 36 ~ PrivateChatService ~ roomList.map ~ item',
                        item,
                    );
                    const dto = new this.chatlogModel({ roomId: id, messages: [] });
                    await dto.save();

                    return true;
                }),
            );

            return true;
        } catch (err) {
            throw stackAikoError(
                err,
                'PrivateChatService/makePrivateChatRoomList',
                500,
                headErrorCode.privateChat + privateChatServiceError.makePrivateChatRoomList,
            );
        }
    }

    async connectPrivateChat(userPK: number, companyPK: number) {
        try {
            const roomList = await getRepo(PrivateChatRoomRepository).getPrivateChatRoomList(userPK, companyPK);

            return roomList;
        } catch (err) {
            throw stackAikoError(
                err,
                'PrivateChatService/connectPrivateChat',
                500,
                headErrorCode.privateChat + privateChatServiceError.connectPrivateChat,
            );
        }
    }

    async sendMessage(payload: IMessagePayload) {
        try {
            await this.updateChatlog(payload);
        } catch (err) {
            throw stackAikoError(
                err,
                'PrivateChatService/sendMessage',
                500,
                headErrorCode.privateChat + privateChatServiceError.sendMessage,
            );
        }
    }

    async getChalog(roomId: string) {
        try {
            return (await this.chatlogModel.findOne({ roomId })) as PrivateChatlog;
        } catch (err) {
            throw stackAikoError(
                err,
                'PrivateChatService/getChalog',
                500,
                headErrorCode.privateChat + privateChatServiceError.getChalog,
            );
        }
    }

    async getUserInfo(roomId: string, companyPK: number, userPK: number) {
        try {
            const roomInfo = await getRepo(PrivateChatRoomRepository).getChatRoomInfo(roomId, companyPK);
            let userInfo: User = undefined;

            if (roomInfo.user1.USER_PK !== userPK) userInfo = roomInfo.user1;
            else userInfo = roomInfo.user2;

            return { roomInfo, userInfo };
        } catch (err) {
            throw stackAikoError(
                err,
                'PrivateChatService/getUserInfo',
                500,
                headErrorCode.privateChat + privateChatServiceError.getUserInfo,
            );
        }
    }

    async decodeSocketToken(socketToken: string) {
        try {
            return await this.statusService.decodeSocketToken(socketToken);
        } catch (err) {
            throw err;
        }
    }

    async addClient(clientId: string, userPK: number, companyPK: number) {
        try {
            const dto = new this.privateClientStorageModel({ clientId, userPK, companyPK });
            await dto.save();

            return true;
        } catch (err) {
            throw stackAikoError(
                err,
                'PrivateChatService/addClient',
                500,
                headErrorCode.privateChat + privateChatServiceError.addClient,
            );
        }
    }

    async getClientInfo(clientId: string) {
        try {
            const { userPK, companyPK } = (await this.privateClientStorageModel
                .findOne({ clientId })
                .exec()) as PrivateChatClientInfo;

            return { userPK, companyPK };
        } catch (err) {
            throw stackAikoError(
                err,
                'PrivateChatService/getClientInfo',
                500,
                headErrorCode.privateChat + privateChatServiceError.getClientInfo,
            );
        }
    }

    // * util functions
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
            throw stackAikoError(
                err,
                'PrivateChatService/updateChatlog',
                500,
                headErrorCode.privateChat + privateChatServiceError.updateChatlog,
            );
        }
    }

    /**
     * 로그 저장 스케줄링 함수
     */
    async storePrivateChatLogsToRDB(serverHour: number) {
        try {
            const allCompanies = await getRepo(CompanyRepository).getAllCompanies();

            let totalRooms: string[] = [];
            const roomsRooms = await Promise.all(
                allCompanies.map(async (company) => {
                    const companyId = company.COMPANY_PK;
                    const rooms = await getRepo(PrivateChatRoomRepository).getPrivateChatRoomListForScheduler(
                        companyId,
                    );
                    return rooms;
                }),
            );

            roomsRooms.forEach((rooms) => {
                const oneCompanyRoomIds = rooms.map((room) => room.CR_PK);
                totalRooms = totalRooms.concat(oneCompanyRoomIds);
            });

            const serverTime = getServerTime(serverHour);

            await Promise.all(
                totalRooms.map(async (roomId) => {
                    const limitTime = serverTime - 604800;

                    const chatLog = (await this.chatlogModel.findOne({ roomId })) as PrivateChatlog;
                    const moveLog = chatLog.messages.filter((message) => message.date <= limitTime);
                    const notYetLog = chatLog.messages.filter((message) => message.date > limitTime);
                    chatLog.messages = notYetLog;

                    await getRepo(ChatLogStorageRepository).saveChatLogs(moveLog, roomId);
                    await this.chatlogModel.findOneAndUpdate({ roomId: roomId }, chatLog);
                }),
            );
        } catch (err) {
            throw stackAikoError(
                err,
                'PrivateChatService/storePrivateChatLogsToRDB',
                500,
                headErrorCode.privateChat + privateChatServiceError.storePrivateChatLogsToRDB,
            );
        }
    }
}
