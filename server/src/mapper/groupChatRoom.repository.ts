import { ResultSetHeader } from 'mysql2';
import { GroupChatRoom } from 'src/entity';
import { AikoError } from 'src/Helpers';
import { EntityManager, EntityRepository, Repository, TransactionManager } from 'typeorm';

@EntityRepository(GroupChatRoom)
export default class GroupChatRoomRepository extends Repository<GroupChatRoom> {
    async createGroupChatRoom(
        ROOM_ADMIN: number,
        ROOM_TITLE: string,
        MAX_NUM: number,
        @TransactionManager() manager: EntityManager,
    ) {
        try {
            const result = await this.createQueryBuilder()
                .insert()
                .into(GroupChatRoom)
                .values({ ROOM_ADMIN, ROOM_TITLE, MAX_NUM })
                .execute();

            return (result.raw as ResultSetHeader).insertId;
        } catch (err) {
            console.error(err);
            throw new AikoError('GroupChatRoomRepository/createGroupChatRoom', 500, 4562123);
        }
    }
}
