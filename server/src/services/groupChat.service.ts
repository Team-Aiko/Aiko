import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/entity';
import { AikoError, getRepo } from 'src/Helpers';
import { Server } from 'socket.io';
import { CompanyRepository, GroupChatRoomRepository } from 'src/mapper';
import GroupChatUserListRepository from 'src/mapper/groupChatUserList.repository';
import { GroupChatClientInfo, GroupChatClientInfoDocument } from 'src/schemas/groupChatClientInfo.schema';
import { getConnection } from 'typeorm';
import { groupChatPath } from 'src/interfaces/MVC/socketMVC';
import { GroupChatLog, GroupChatLogDocument } from 'src/schemas/groupChatlog.schema';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';
import { getServerTime, stackAikoError, tokenParser } from 'src/Helpers/functions';
import GroupChatStorageRepository from 'src/mapper/groupChatStorage.repository';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';

// mongoose의 dto.save()와 model.create()의 차이: save는 만들거나 업데이트 / create는 만들기만 함.

enum groupChatService {
    addClientForGroupChat = 1,
    createGroupChatRoom = 2,
    findChatRooms = 3,
    sendMessageToGroup = 4,
    addNewClientForGroupChat = 5,
    readChatLogs = 6,
    storeGroupChatLog = 7,
    getUserInfos = 8,
    insertGroupChatClientInfo = 9,
    findGroupChatClient = 10,
    findGroupChatLogs = 11,
    createChatRoom = 12,
    deleteChatRoom = 13,
    getChatLog = 14,
    updateChatLog = 15,
    deleteClientInfo = 16,
}

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
            throw stackAikoError(
                err,
                'GroupChatService/addClientForGroupChat',
                500,
                headErrorCode.groupChat + groupChatService.addClientForGroupChat,
            );
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
                COMPANY_PK,
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
                .in(verifiedList)
                .select('clientId userPK companyPK')) as GroupChatClientInfo[];

            return { memberList, GC_PK, COMPANY_PK, USER_PK };
        } catch (err) {
            await this.deleteChatRoom(GC_PK);
            await queryRunner.rollbackTransaction();
            throw stackAikoError(
                err,
                'GroupChatService/createGroupChatRoom',
                500,
                headErrorCode.groupChat + groupChatService.createGroupChatRoom,
            );
        } finally {
            await queryRunner.release();
        }
    }

    async findChatRooms({ USER_PK }: IUserPayload) {
        try {
            const groupChatRooms = await getRepo(GroupChatUserListRepository).findChatRooms(USER_PK);
            return groupChatRooms;
        } catch (err) {
            throw stackAikoError(
                err,
                'GroupChatService/findChatRooms',
                500,
                headErrorCode.groupChat + groupChatService.findChatRooms,
            );
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
            throw stackAikoError(
                err,
                'GroupChatService/sendMessageToGroup',
                500,
                headErrorCode.groupChat + groupChatService.sendMessageToGroup,
            );
        }
    }

    async addNewClientForGroupChat(userPK: number) {
        try {
        } catch (err) {
            throw stackAikoError(
                err,
                'GroupChatService/addNewClientForGroupChat',
                500,
                headErrorCode.groupChat + groupChatService.addNewClientForGroupChat,
            );
        }
    }

    async readChatLogs(GC_PK: number, COMPANY_PK: number) {
        try {
            return await this.findGroupChatLogs(GC_PK, COMPANY_PK);
        } catch (err) {
            throw stackAikoError(
                err,
                'GroupChatService/readChatLogs',
                500,
                headErrorCode.groupChat + groupChatService.readChatLogs,
            );
        }
    }

    async storeGroupChatLog(serverHour: number) {
        try {
            const serverTime = getServerTime(serverHour);
            const limitTime = serverTime - 60 * 60 * 24 * 30;
            const companyList = (await getRepo(CompanyRepository).getAllCompanies()).map(
                (company) => company.COMPANY_PK,
            );

            const chatLogList = (await this.groupChatLogModel
                .find()
                .where('companyPK')
                .in(companyList)
                .select('GC_PK companyPK chatLog')
                .exec()) as GroupChatLog[];

            const storedLogList = chatLogList.map((logs) => {
                const storedLogs = logs.chatLog.filter((oneLog) => oneLog.date <= limitTime);
                const { GC_PK, companyPK } = logs;
                return { GC_PK, companyPK, storedLogs };
            });

            const modifiedChatLogList = chatLogList.map((logs) => {
                const { chatLog } = logs;
                logs.chatLog = chatLog.filter((oneLog) => oneLog.date > limitTime);

                return logs;
            });

            await getRepo(GroupChatStorageRepository).storeLogsForScheduler(storedLogList);
            await Promise.all(modifiedChatLogList.map(async (log) => await this.updateChatLog(log)));
        } catch (err) {
            throw stackAikoError(
                err,
                'GroupChatService/storeGroupChatLog',
                500,
                headErrorCode.groupChat + groupChatService.storeGroupChatLog,
            );
        }
    }

    async getUserInfos(GC_PK: number, companyPK: number) {
        try {
            return await getRepo(GroupChatUserListRepository).getMembersInGroupChatRoom(GC_PK, companyPK);
        } catch (err) {
            throw stackAikoError(
                err,
                'GroupChatService/getUserInfos',
                500,
                headErrorCode.groupChat + groupChatService.getUserInfos,
            );
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
            throw stackAikoError(
                err,
                'GroupChatService/insertGroupChatClientInfo',
                500,
                headErrorCode.groupChat + groupChatService.insertGroupChatClientInfo,
            );
        }
    }
    async findGroupChatClient(userPK: number) {
        try {
            return (await this.groupChatClientModel.find({ userPK }).exec()) as GroupChatClientInfo[];
        } catch (err) {
            throw stackAikoError(
                err,
                'GroupChatService/findGroupChatClient',
                500,
                headErrorCode.groupChat + groupChatService.findGroupChatClient,
            );
        }
    }

    async findGroupChatLogs(GC_PK: number, companyPK: number) {
        try {
            return (await this.groupChatLogModel.findOne({ GC_PK, companyPK }).exec()) as GroupChatLog;
        } catch (err) {
            throw stackAikoError(
                err,
                'GroupChatService/findGroupChatLogs',
                500,
                headErrorCode.groupChat + groupChatService.findGroupChatLogs,
            );
        }
    }

    async createChatRoom(GC_PK: number, companyPK: number) {
        try {
            const dto = new this.groupChatLogModel({ GC_PK, companyPK, chatLog: [] });
            await this.groupChatLogModel.create(dto);
        } catch (err) {
            throw stackAikoError(
                err,
                'GroupChatService/createChatRoom',
                500,
                headErrorCode.groupChat + groupChatService.createChatRoom,
            );
        }
    }

    async deleteChatRoom(GC_PK: number) {
        try {
            await this.groupChatLogModel.findOneAndDelete({ GC_PK }).exec();
        } catch (err) {
            throw stackAikoError(
                err,
                'GroupChatService/deleteChatRoom',
                500,
                headErrorCode.groupChat + groupChatService.deleteChatRoom,
            );
        }
    }

    async getChatLog(GC_PK: number, companyPK: number) {
        try {
            return (await this.groupChatLogModel.findOne({ GC_PK, companyPK }).exec()) as GroupChatLog;
        } catch (err) {
            throw stackAikoError(
                err,
                'GroupChatService/getChatLog',
                500,
                headErrorCode.groupChat + groupChatService.getChatLog,
            );
        }
    }

    async updateChatLog(chatLog: GroupChatLog) {
        try {
            await this.groupChatLogModel.findOneAndUpdate({ GC_PK: chatLog.GC_PK }, chatLog).exec();
        } catch (err) {
            throw stackAikoError(
                err,
                'GroupChatService/updateChatLog',
                500,
                headErrorCode.groupChat + groupChatService.updateChatLog,
            );
        }
    }

    async deleteClientInfo(clientId: string) {
        try {
            await this.groupChatClientModel.findOneAndDelete({ clientId }).exec();
        } catch (err) {
            throw stackAikoError(
                err,
                'GroupChatService/deleteClientInfo',
                500,
                headErrorCode.groupChat + groupChatService.deleteClientInfo,
            );
        }
    }
}
