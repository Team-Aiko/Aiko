import GroupChatUserList from 'src/entity/groupChatUL.entity';
import { AikoError, propsRemover } from 'src/Helpers';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { EntityManager, EntityRepository, Repository, TransactionManager } from 'typeorm';

const criticalInfos = ['SALT', 'PASSWORD', 'COUNTRY_PK', 'IS_DELETED', 'IS_VERIFIED'];

enum groupChatUserListError {
    insertUserListInNewGroupChatRoom = 1,
    findChatRooms = 2,
    getMembersInGroupChatRoom = 3,
}

@EntityRepository(GroupChatUserList)
export default class GroupChatUserListRepository extends Repository<GroupChatUserList> {
    async insertUserListInNewGroupChatRoom(
        DTOs: { GC_PK: number; USER_PK: number }[],
        @TransactionManager() manager: EntityManager,
    ) {
        try {
            await manager.insert(GroupChatUserList, DTOs);
        } catch (err) {
            console.error(err);
            throw new AikoError(
                'GroupChatUserListRepository/insertUserListInNewGroupChatRoom',
                500,
                headErrorCode.groupChatUserListDB + groupChatUserListError.insertUserListInNewGroupChatRoom,
            );
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
            throw new AikoError(
                'GroupChatUserListRepository/findChatRooms',
                500,
                headErrorCode.groupChatUserListDB + groupChatUserListError.findChatRooms,
            );
        }
    }

    async getMembersInGroupChatRoom(GC_PK: number, COMPANY_PK: number) {
        try {
            const list = await this.createQueryBuilder('gcr')
                .leftJoinAndSelect('gcr.user', 'user')
                .leftJoinAndSelect('user.department', 'department')
                .where('gcr.GC_PK = :GC_PK', { GC_PK })
                .andWhere('gcr.COMPANY_PK = :COMPANY_PK', { COMPANY_PK })
                .getMany();

            return list.map((item) => propsRemover(item.user, ...criticalInfos));
        } catch (err) {
            console.error(err);
            throw new AikoError(
                'GroupChatUserListRepository/getMembersInGroupChatRoom',
                500,
                headErrorCode.groupChatUserListDB + groupChatUserListError.getMembersInGroupChatRoom,
            );
        }
    }
}
