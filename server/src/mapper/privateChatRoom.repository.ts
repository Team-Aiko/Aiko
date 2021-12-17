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
            await manager.insert(PrivateChatRoom, DTOs);
        } catch (err) {
            console.log(err);
            throw new AikoError('PrivateChatRoomRepository/makePrivateChatRoomList', 500, 500360);
        }
    }

    async getPrivateChatRoomList(userId: number, companyPK: number) {
        let list: PrivateChatRoom[] = [];

        try {
            list = await this.createQueryBuilder('o')
                .where('o.COMPANY_PK = :COMPANY_PK', { COMPANY_PK: companyPK })
                .leftJoinAndSelect('o.user1', 'user1')
                .leftJoinAndSelect('o.user2', 'user2')
                .where('o.USER_1 = :USER1', { USER1: userId })
                .orWhere('o.USER_2 = :USER2', { USER2: userId })
                .getMany();

            return list.map((room) => {
                room.user1 = propsRemover(room.user1, ...criticalInfos);
                room.user2 = propsRemover(room.user2, ...criticalInfos);

                return room;
            });
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
}
