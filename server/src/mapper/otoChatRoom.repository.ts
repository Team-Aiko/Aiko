import { EntityRepository, getConnection, InsertResult, Repository } from 'typeorm';
import { OTOChatRoom, User } from '../entity';
import { v1 } from 'uuid';

@EntityRepository(OTOChatRoom)
export default class OTOChatRoomRepository extends Repository<OTOChatRoom> {
    async makeOneToOneChatRooms(userId: number, userList: User[], companyPK: number): Promise<boolean> {
        let flag = false;

        try {
            const result = await Promise.all(
                userList.map(async (another) => {
                    let flag2 = false;

                    try {
                        const id = another.USER_PK;
                        const cnt = await this.createQueryBuilder('o')
                            .where('o.COMPANY_PK = :companyPK', { companyPK: companyPK })
                            .where('o.USER_1 = :id', { id: id })
                            .orWhere('o.USER_2 = :id', { id: id })
                            .getCount();
                        if (cnt >= 1) return true;

                        await this.createQueryBuilder('o')
                            .insert()
                            .into(OTOChatRoom)
                            .values({
                                CR_PK: v1(),
                                USER_1: userId,
                                USER_2: id,
                                COMPANY_PK: companyPK,
                            })
                            .execute();

                        flag2 = true;
                    } catch (err) {
                        console.error(err);
                    }

                    return flag2;
                }),
            );

            flag = result.reduce((prev, curr) => prev && curr, true);
        } catch (err) {
            console.error(err);
            throw err;
        }

        return flag;
    }

    async getOneToOneChatRoomList(userId: number, companyPK: number): Promise<OTOChatRoom[]> {
        let list: OTOChatRoom[] = [];

        try {
            list = await this.createQueryBuilder('o')
                .where('o.COMPANY_PK =:companyPK', { companyPK: companyPK })
                .where('o.USER_1 = :id', { id: userId })
                .orWhere('o.USER_2 = :id', { id: userId })
                .getMany();
        } catch (err) {
            console.error(err);
            throw err;
        }

        return list;
    }
}
