import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/entity';
import { AikoError, getRepo } from 'src/Helpers';
import { Server } from 'socket.io';
import { GroupChatRoomRepository, UserRepository } from 'src/mapper';
import GroupChatUserListRepository from 'src/mapper/groupChatUserList.entity';
import { GroupChatClientInfo, GroupChatClientInfoDocument } from 'src/schemas/groupChatClientInfo.schema';
import { getConnection } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { groupChatPath } from 'src/interfaces/MVC/socketMVC';
import { GroupChatLog, GroupChatLogDocument } from 'src/schemas/groupChatlog.schema';
import { accessTokenBluePrint } from 'src/interfaces/jwt/secretKey';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';
import { tokenParser } from 'src/Helpers/functions';

// mongoose의 dto.save()와 model.create()의 차이: save는 만들거나 업데이트 / create는 만들기만 함.

/**
 * 그룹채팅의 비즈니스 로직을 담당하는 서비스 클래스
 */
@Injectable()
export default class GroupChatService {
    constructor(
        @InjectModel(GroupChatClientInfo.name) private groupChatClientModel: Model<GroupChatClientInfoDocument>,
        @InjectModel(GroupChatLog.name) private groupChatLogModel: Model<GroupChatLogDocument>,
    ) {}

    async addClientForGroupChat(clientId: string, { USER_PK, COMPANY_PK }: IUserPayload) {
        try {
            await this.insertGroupChatClientInfo(USER_PK, COMPANY_PK, clientId);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    /**
     * 그룹챗룸을 만들고 유저를 초대하는 메소드
     */
    async createGroupChatRoom({
        userList,
        roomTitle,
        maxNum,
        accessToken,
    }: {
        userList: number[];
        roomTitle: string;
        maxNum: number;
        accessToken: string;
    }) {
        let GC_PK = 0;
        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // verify accessToken
            const { COMPANY_PK, USER_PK } = tokenParser(accessToken);

            // 해당 회사키로 초대유저 적합성 판단
            const verifiedList = await connection
                .createQueryBuilder(User, 'u')
                .where('u.USER_PK IN (:...userList)', { userList })
                .andWhere('u.COMPANY_PK = :COMPANY_PK', { COMPANY_PK })
                .getMany();

            // 그룹챗 룸생성 (rdb에 추가 및 mongodb 로그 데이터 추가)
            GC_PK = await getRepo(GroupChatRoomRepository).createGroupChatRoom(
                USER_PK,
                roomTitle,
                maxNum,
                queryRunner.manager,
            );
            await this.createChatRoom(GC_PK, COMPANY_PK);

            // 생성된 그룹챗룸에 적합한 유저를 초대 (rdb에 추가)
            await getRepo(GroupChatUserListRepository).insertUserListInNewGroupChatRoom(
                verifiedList.map((user) => ({ USER_PK: user.USER_PK, GC_PK })),
                queryRunner.manager,
            );

            await queryRunner.commitTransaction();
            const memberList = (await this.groupChatClientModel
                .find()
                .where('userPK')
                .in(userList)
                .select('clientId userPK companyPK')) as GroupChatClientInfo[];

            return { memberList, GC_PK, COMPANY_PK, USER_PK };
        } catch (err) {
            await this.deleteChatRoom(GC_PK);
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async findChatRooms({ USER_PK }: IUserPayload) {
        try {
            const groupChatRooms = await getRepo(GroupChatUserListRepository).findChatRooms(USER_PK);
            return groupChatRooms;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async sendMessageToGroup(
        {
            GC_PK,
            accessToken,
            file,
            message,
            date,
        }: { GC_PK: number; accessToken: string; file: number; message: string; date: number },
        wss: Server,
    ) {
        try {
            const { COMPANY_PK, USER_PK } = tokenParser(accessToken);
            const chatLog = await this.getChatLog(GC_PK, COMPANY_PK);

            chatLog.chatLog.push({ sender: USER_PK, file, message, date });
            await this.updateChatLog(chatLog);

            wss.to(`company:${COMPANY_PK}-${GC_PK}`).emit(groupChatPath.CLIENT_SEND_MESSAGE, {
                GC_PK,
                file,
                message,
                sender: USER_PK,
                date,
            });
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async addNewClientForGroupChat(userPK: number) {
        try {
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async readChatLogs(GC_PK: number, COMPANY_PK: number) {
        try {
            return await this.findGroupChatLogs(GC_PK, COMPANY_PK);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    // * util functions
    async insertGroupChatClientInfo(userPK: number, companyPK: number, clientId: string) {
        try {
            const dto = new this.groupChatClientModel({
                clientId,
                userPK,
                companyPK,
            });
            await this.groupChatClientModel.create(dto);
        } catch (err) {
            console.error(err);
            throw new AikoError('groupChatService/insertGroupChatClientInfo', 0, 696022);
        }
    }
    async findGroupChatClient(userPK: number) {
        try {
            return (await this.groupChatClientModel.find({ userPK }).exec()) as GroupChatClientInfo[];
        } catch (err) {
            console.error(err);
            throw new AikoError('groupChatService/findGroupChatClient', 0, 812293);
        }
    }

    async findGroupChatLogs(GC_PK: number, companyPK: number) {
        try {
            return (await this.groupChatLogModel.findOne({ GC_PK, companyPK }).exec()) as GroupChatLog;
        } catch (err) {
            throw new AikoError('groupChatService/findGroupChatLogs', 0, 812294);
        }
    }

    async createChatRoom(GC_PK: number, companyPK: number) {
        try {
            const dto = new this.groupChatLogModel({ GC_PK, companyPK, chatLog: [] });
            await this.groupChatLogModel.create(dto);
        } catch (err) {
            console.error(err);
            throw new AikoError('groupChatService/createChatRoom', 0, 982819);
        }
    }

    async deleteChatRoom(GC_PK: number) {
        try {
            await this.groupChatLogModel.findOneAndDelete({ GC_PK }).exec();
        } catch (err) {
            console.error(err);
            throw new AikoError('groupChatService/createChatRoom', 0, 982820);
        }
    }

    async getChatLog(GC_PK: number, companyPK: number) {
        try {
            return (await this.groupChatLogModel.findOne({ GC_PK, companyPK }).exec()) as GroupChatLog;
        } catch (err) {
            console.error(err);
            throw new AikoError('groupChatService/getChatLog', 0, 828192);
        }
    }

    async updateChatLog(chatLog: GroupChatLog) {
        try {
            await this.groupChatLogModel.findOneAndUpdate({ GC_PK: chatLog.GC_PK }, chatLog).exec();
        } catch (err) {
            console.error(err);
            throw new AikoError('groupChatService/updateChatLog', 0, 828192);
        }
    }

    async deleteClientInfo(clientId: string) {
        try {
            await this.groupChatClientModel.findOneAndDelete({ clientId }).exec();
        } catch (err) {
            console.error(err);
            throw new AikoError('groupChatService/deleteClientInfo', 0, 1827289);
        }
    }
}
