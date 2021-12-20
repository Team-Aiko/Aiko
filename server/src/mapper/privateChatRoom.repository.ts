import { EntityManager, EntityRepository, Repository } from 'typeorm';
import { PrivateChatRoom, User } from '../entity';
import { v1 } from 'uuid';
import { AikoError } from 'src/Helpers/classes';
import { propsRemover } from 'src/Helpers';

const criticalInfos = ['SALT', 'PASSWORD', 'COUNTRY_PK', 'IS_DELETED', 'IS_VERIFIED'];

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
            console.log(err);
            throw new AikoError('PrivateChatRoomRepository/makePrivateChatRoomList', 500, 500360);
        }
    }

    async getPrivateChatRoomList(userId: number, companyPK: number) {
        try {
            const oddCase = await this.find({ USER_1: userId, COMPANY_PK: companyPK });
            const evenCase = await this.find({ USER_2: userId, COMPANY_PK: companyPK });

            return { oddCase, evenCase };
        } catch (err) {
            console.error(err);
            throw new AikoError('PrivateChatRoomRepository/getOneToOneChatRoomList', 500, 500360);
        }
    }

    async getPrivateChatRoomListForScheduler(COMPANY_PK: number) {
        try {
            return await this.find({ COMPANY_PK });
        } catch (err) {
            console.error(err);
            throw new AikoError('PrivateChatRoomRepository/getPrivateChatRoomListForScheduler', 500, 1892894);
        }
    }

    async getChatRoomInfo(roomId: string) {
        try {
            const roomInfo = await this.createQueryBuilder('pcr')
                .leftJoinAndSelect('pcr.user1', 'user1')
                .leftJoinAndSelect('prc.user2', 'user2')
                .leftJoinAndSelect('user1.department', 'department1')
                .leftJoinAndSelect('user2.department', 'department2')
                .where(`pcr.CR_PK = '${roomId}'`)
                .getOneOrFail();

            let { user1, user2 } = roomInfo;
            user1 = propsRemover(user1, ...criticalInfos);
            user2 = propsRemover(user2, ...criticalInfos);

            return { user1, user2 };
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}
