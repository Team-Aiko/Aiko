import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AikoError, getRepo } from 'src/Helpers';
import { IMessagePayload } from 'src/interfaces/MVC/socketMVC';
import { PrivateChatRoomRepository, UserRepository } from 'src/mapper';
import { PrivateChatlog, PrivateChatlogDocument } from 'src/schemas/chatlog.schema';
import { EntityManager, TransactionManager } from 'typeorm';

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

    async getChalog(roomId: string) {
        try {
            return (await this.chatlogModel.findOne({ roomId })) as PrivateChatlog;
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
}
