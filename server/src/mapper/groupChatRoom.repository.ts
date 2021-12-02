import { GroupChatRoom } from 'src/entity';
import { AikoError } from 'src/Helpers';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(GroupChatRoom)
export default class GroupChatRoomRepository extends Repository<GroupChatRoom> {
    async createGroupChatRoom() {
        try {
        } catch (err) {
            console.error(err);
            throw new AikoError('GroupChatRoomRepository/createGroupChatRoom', 500, 4562123);
        }
    }
}
