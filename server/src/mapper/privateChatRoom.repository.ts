import { EntityManager, EntityRepository, Repository } from 'typeorm';
import { PrivateChatRoom, User } from '../entity';
import { v1 } from 'uuid';
import { AikoError } from 'src/Helpers/classes';
import { propsRemover } from 'src/Helpers';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { stackAikoError } from 'src/Helpers/functions';

const criticalInfos = ['SALT', 'PASSWORD', 'COUNTRY_PK', 'IS_DELETED', 'IS_VERIFIED'];

enum privateChatRoomError {
    makePrivateChatRoomList = 1,
    getPrivateChatRoomList = 2,
    getPrivateChatRoomListForScheduler = 3,
    getChatRoomInfo = 4,
}

@EntityRepository(PrivateChatRoom)
export default class PrivateChatRoomRepository extends Repository<PrivateChatRoom> {
    async makePrivateChatRoomList(manager: EntityManager, userId: number, userList: User[], companyPK: number) {
        try {
            const DTOs = userList
                .filter((user) => user.USER_PK !== userId)
                .map((item) => ({
                    CR_PK: v1(),
                    USER_1: userId,
                    USER_2: item.USER_PK,
                    COMPANY_PK: companyPK,
                }));
            const insertedResult = (await manager.insert(PrivateChatRoom, DTOs)).identifiers as { CR_PK: string }[];
            return insertedResult.map((key) => key.CR_PK);
        } catch (err) {
            throw stackAikoError(
                err,
                'PrivateChatRoomRepository/makePrivateChatRoomList',
                500,
                headErrorCode.privateChatRoomDB + privateChatRoomError.makePrivateChatRoomList,
            );
        }
    }

    async getPrivateChatRoomList(userId: number, companyPK: number) {
        try {
            const oddCase = await this.find({ USER_1: userId, COMPANY_PK: companyPK });
            const evenCase = await this.find({ USER_2: userId, COMPANY_PK: companyPK });

            return { oddCase, evenCase };
        } catch (err) {
            throw stackAikoError(
                err,
                'PrivateChatRoomRepository/getOneToOneChatRoomList',
                500,
                headErrorCode.privateChatRoomDB + privateChatRoomError.getPrivateChatRoomList,
            );
        }
    }

    async getPrivateChatRoomListForScheduler(COMPANY_PK: number) {
        try {
            return await this.find({ COMPANY_PK });
        } catch (err) {
            throw stackAikoError(
                err,
                'PrivateChatRoomRepository/getPrivateChatRoomListForScheduler',
                500,
                headErrorCode.privateChatRoomDB + privateChatRoomError.getPrivateChatRoomListForScheduler,
            );
        }
    }

    async getChatRoomInfo(roomId: string, companyPK: number) {
        try {
            const roomInfo = await this.createQueryBuilder('pcr')
                .leftJoinAndSelect('pcr.user1', 'user1')
                .leftJoinAndSelect('pcr.user2', 'user2')
                .leftJoinAndSelect('user1.department', 'department1')
                .leftJoinAndSelect('user2.department', 'department2')
                .where(`pcr.CR_PK = '${roomId}'`)
                .andWhere(`pcr.COMPANY_PK = ${companyPK}`)
                .getOneOrFail();

            const { user1, user2 } = roomInfo;
            roomInfo.user1 = propsRemover(user1, ...criticalInfos);
            roomInfo.user2 = propsRemover(user2, ...criticalInfos);

            return roomInfo;
        } catch (err) {
            throw stackAikoError(
                err,
                'PrivateChatRoomRepository/getChatRoomInfo',
                500,
                headErrorCode.privateChatRoomDB + privateChatRoomError.getChatRoomInfo,
            );
        }
    }
}
