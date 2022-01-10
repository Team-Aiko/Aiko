import { ResultSetHeader } from 'mysql2';
import { GroupChatRoom } from 'src/entity';
import { AikoError } from 'src/Helpers';
import { stackAikoError } from 'src/Helpers/functions';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { EntityManager, EntityRepository, Repository, TransactionManager } from 'typeorm';

enum groupChatRoomError {
    createGroupChatRoom = 1,
}

@EntityRepository(GroupChatRoom)
export default class GroupChatRoomRepository extends Repository<GroupChatRoom> {
    async createGroupChatRoom(
        COMPANY_PK: number,
        ROOM_ADMIN: number,
        ROOM_TITLE: string,
        MAX_NUM: number,
        @TransactionManager() manager: EntityManager,
    ) {
        try {
            const result = await this.createQueryBuilder()
                .insert()
                .into(GroupChatRoom)
                .values({ ROOM_ADMIN, ROOM_TITLE, MAX_NUM, COMPANY_PK })
                .execute();

            return (result.raw as ResultSetHeader).insertId;
        } catch (err) {
            throw stackAikoError(
                err,
                'GroupChatRoomRepository/createGroupChatRoom',
                500,
                headErrorCode.groupChatRoomDB + groupChatRoomError.createGroupChatRoom,
            );
        }
    }
}
