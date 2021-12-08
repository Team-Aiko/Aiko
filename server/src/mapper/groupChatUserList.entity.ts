import GroupChatUserList from 'src/entity/groupChatUserList.entity';
import { AikoError } from 'src/Helpers';
import { EntityManager, EntityRepository, Repository, TransactionManager } from 'typeorm';

@EntityRepository(GroupChatUserList)
export default class GroupChatUserListRepository extends Repository<GroupChatUserList> {
    async insertUserListInNewGroupChatRoom(
        GC_PK: number,
        userList: number[],
        @TransactionManager() manager: EntityManager,
    ) {
        try {
            await manager.insert(
                GroupChatUserList,
                userList.map((user) => {
                    return { GC_PK, USER_PK: user };
                }),
            );
        } catch (err) {
            console.error(err);
            throw new AikoError('GroupChatUserListRepository/insertUserListInNewGroupChatRoom', 500, 2911855);
        }
    }

    async findChatRooms(USER_PK: number) {
        try {
            const list = await this.createQueryBuilder('g')
                .leftJoinAndSelect('g.groupChatRoom', 'groupChatRoom')
                .leftJoinAndSelect('groupChatRoom.members', 'members')
                .where('g.USER_PK = :USER_PK', { USER_PK })
                .getMany();

            return list.map((item) => item.groupChatRoom);
        } catch (err) {
            console.error(err);
            throw new AikoError('GroupChatUserListRepository/findChatRooms', 500, 2911855);
        }
    }
}
