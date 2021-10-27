import { MeetRoom } from 'src/entity';
import { EntityManager, EntityRepository, getConnection, Repository, Transaction, TransactionManager } from 'typeorm';

@EntityRepository(MeetRoom)
export default class MeetRoomRepository extends Repository<MeetRoom> {}
