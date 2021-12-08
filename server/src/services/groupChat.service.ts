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
import { groupChatPath } from 'src/interfaces/MVC/socketMVC';

@Injectable()
export default class GroupChatService {
    constructor(
        @InjectModel(GroupChatClientInfo.name) private groupChatClientModel: Model<GroupChatClientInfoDocument>,
    ) {}

    async addClientForGroupChat(clientId: string, { USER_PK, COMPANY_PK }: User) {
        try {
            let clientInfo = await this.findGroupChatClient(USER_PK);

            if (clientInfo.userPK) {
                await this.insertGroupChatClientInfo(USER_PK, COMPANY_PK, clientId);
                clientInfo = await this.findGroupChatClient(USER_PK);
            }

            return clientInfo;
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
        admin,
        roomTitle,
        maxNum,
    }: {
        userList: number[];
        admin: number;
        roomTitle: string;
        maxNum: number;
    }) {
        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // admin의 유저정보 셀렉트(회사키를 이용)
            const adminInfo = await getRepo(UserRepository).getUserInfoWithUserPK(admin);
            // 해당 회사키로 초대유저 적합성 판단
            const verifiedList = await connection
                .createQueryBuilder(User, 'u')
                .where('u.USER_PK IN (:...userList)', { userList: userList })
                .andWhere('u.COMPANY_PK = :COMPANY_PK', { COMPANY_PK: adminInfo.COMPANY_PK })
                .getMany();
            // 그룹챗 룸생성
            const GC_PK = await getRepo(GroupChatRoomRepository).createGroupChatRoom(
                admin,
                roomTitle,
                maxNum,
                queryRunner.manager,
            );
            // 생성된 그룹챗룸에 적합한 유저를 초대
            await getRepo(GroupChatUserListRepository).insertUserListInNewGroupChatRoom(
                GC_PK,
                verifiedList.map((user) => user.USER_PK),
                queryRunner.manager,
            );

            await queryRunner.commitTransaction();
            const memberList = (await this.groupChatClientModel
                .find()
                .where('userPK')
                .in(userList)
                .select('clientId userPK companyPK')) as GroupChatClientInfo[];

            return { memberList, GC_PK, COMPANY_PK: adminInfo.COMPANY_PK };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async findChatRooms({ USER_PK }: User) {
        try {
            const groupChatRooms = await getRepo(GroupChatUserListRepository).findChatRooms(USER_PK);
            return groupChatRooms;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async sendMessageToGroup(payload: { GC_PK: number; sender: number; file: number; message: string }, wss: Server) {
        try {
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

    // * util functions
    async insertGroupChatClientInfo(userPK: number, companyPK: number, clientId: string) {
        try {
            const pack = {
                clientId,
                userPK,
                companyPK,
            };

            const dto = new this.groupChatClientModel(pack);
            await this.groupChatClientModel.create(pack);
            await dto.save();
        } catch (err) {
            console.error(err);
            throw new AikoError('groupChatService/insertGroupChatClientInfo', 0, 696022);
        }
    }
    async findGroupChatClient(userPK: number) {
        try {
            return (await this.groupChatClientModel.findOne({ userPK }).exec()) as GroupChatClientInfo;
        } catch (err) {
            console.error(err);
            throw new AikoError('groupChatService/findGroupChatClient', 0, 812293);
        }
    }
}
