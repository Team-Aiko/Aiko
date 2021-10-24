import { EntityManager, EntityRepository, getConnection, InsertResult, Repository, TransactionManager } from 'typeorm';
import { OTOChatRoom, User } from '../entity';
import { v1 } from 'uuid';
import { AikoError } from 'src/Helpers/classes';

@EntityRepository(OTOChatRoom)
export default class OTOChatRoomRepository extends Repository<OTOChatRoom> {
    async makeOneToOneChatRooms(
        manager: EntityManager,
        userId: number,
        userList: User[],
        companyPK: number,
    ): Promise<boolean> {
        console.log('🚀 ~ file: otoChatRoom.repository.ts ~ line 13 ~ OTOChatRoomRepository ~ userList', userList);
        let flag = false;

        try {
            const result = await Promise.all(
                userList.map(async (another) => {
                    let flag2 = false;

                    try {
                        const id = another.USER_PK;
                        const cnt = await this.createQueryBuilder('o')
                            .where('o.COMPANY_PK = COMPANY_PK', { COMPANY_PK: companyPK })
                            .where('o.USER_1 = :USER_1', { USER_1: id })
                            .orWhere('o.USER_2 = :USER_2', { USER_2: id })
                            .getCount();

                        if (cnt > 0) return true;

                        await manager.insert(OTOChatRoom, {
                            CR_PK: v1(),
                            USER_1: userId,
                            USER_2: id,
                            COMPANY_PK: companyPK,
                        });

                        flag2 = true;
                    } catch (err) {
                        throw new AikoError('otoChat/makeOneToOneChatRooms', 500, 500360);
                    }

                    return flag2;
                }),
            );
            console.log('🚀 ~ file: otoChatRoom.repository.ts ~ line 45 ~ OTOChatRoomRepository ~ result', result);

            flag = result.reduce((prev, curr) => prev && curr, true);
            console.log('🚀 ~ file: otoChatRoom.repository.ts ~ line 48 ~ OTOChatRoomRepository ~ flag', flag);
        } catch (err) {
            throw err;
        }

        return flag;
    }

    async getOneToOneChatRoomList(userId: number, companyPK: number): Promise<OTOChatRoom[]> {
        let list: OTOChatRoom[] = [];

        try {
            list = await this.createQueryBuilder('o')
                .where('o.COMPANY_PK = :COMPANY_PK', { COMPANY_PK: companyPK })
                .leftJoinAndSelect('o.USER1', 'user1')
                .leftJoinAndSelect('o.USER1', 'user2')
                .where('o.USER_1 = :USER1', { USER1: userId })
                .orWhere('o.USER_2 = :USER2', { USER2: userId })
                .getMany();
        } catch (err) {
            throw new AikoError('otoChat/getOneToOneChatRoomList', 500, 500360);
        }

        return list;
    }
}
