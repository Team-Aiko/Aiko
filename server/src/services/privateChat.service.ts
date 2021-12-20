import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getServerTime, tokenParser } from 'src/Helpers/functions';
import { AikoError, getRepo } from 'src/Helpers';
import { IMessagePayload } from 'src/interfaces/MVC/socketMVC';
import { CompanyRepository, PrivateChatRoomRepository, UserRepository } from 'src/mapper';
import ChatLogStorageRepository from 'src/mapper/chatLogStorage.repository';
import { PrivateChatlog, PrivateChatlogDocument } from 'src/schemas/chatlog.schema';
import { EntityManager, getConnection, TransactionManager } from 'typeorm';
import { PrivateChatRoom } from 'src/entity';

@Injectable()
export default class PrivateChatService {
    constructor(@InjectModel(PrivateChatlog.name) private chatlogModel: Model<PrivateChatlogDocument>) {}

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
            throw new AikoError('PrivateChatService/makePrivateChatRoomList', 500, 129828);
        }
    }

    async connectPrivateChat(socketId: string, accessToken: string) {
        try {
            const { USER_PK, COMPANY_PK } = tokenParser(accessToken);

            const roomList = await getRepo(PrivateChatRoomRepository).getPrivateChatRoomList(USER_PK, COMPANY_PK);

            return roomList;
        } catch (err) {
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

    async getChalog(roomId: string) {
        try {
            return (await this.chatlogModel.findOne({ roomId })) as PrivateChatlog;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async getUserInfo(roomId: string) {
        try {
            const privateChat = await getRepo(PrivateChatRoomRepository).getChatRoomInfo(roomId);
            const { user1, user2 } = privateChat;

            return { user1, user2 };
        } catch (err) {
            console.error(err);
            throw err;
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
            console.error(err);
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

            Promise.all(
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
            console.error(err);
            throw err;
        }
    }

    // * temp method for migration
    async chatRoomGenerator(accessToken: string) {
        try {
            const { COMPANY_PK } = tokenParser(accessToken);
            const chatRooms = await getConnection()
                .createQueryBuilder(PrivateChatRoom, 'c')
                .where('c.COMPANY_PK = :COMPANY_PK', { COMPANY_PK })
                .getMany();

            await Promise.all(
                chatRooms.map(async (room) => {
                    const dto = new this.chatlogModel({ roomId: room.CR_PK, messages: [] });
                    await dto.save();

                    return true;
                }),
            );

            return true;
        } catch (err) {
            throw err;
        }
    }
}
