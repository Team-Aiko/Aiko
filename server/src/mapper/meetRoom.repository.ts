import { ResultSetHeader } from 'mysql2';
import { MeetRoom } from 'src/entity';
import { AikoError, getRepo, propsRemover, unixTimeStamp } from 'src/Helpers';
import { unixTimeEnum } from 'src/interfaces';
import {
    Brackets,
    EntityManager,
    EntityRepository,
    getConnection,
    Repository,
    Transaction,
    TransactionManager,
} from 'typeorm';
import MeetRepository from './meet.repository';

@EntityRepository(MeetRoom)
export default class MeetRoomRepository extends Repository<MeetRoom> {
    async makeMeetingRoom(COMPANY_PK: number, IS_ONLINE: boolean, LOCATE: string, ROOM_NAME: string) {
        try {
            const insertResult = await this.createQueryBuilder()
                .insert()
                .into(MeetRoom)
                .values({
                    COMPANY_PK,
                    ROOM_NAME,
                    LOCATE,
                    IS_ONLINE: Number(IS_ONLINE),
                })
                .execute();
            return (insertResult.raw as ResultSetHeader).insertId;
        } catch (err) {
            console.error(err);
            throw new AikoError('meetRoom/makeMeetingRoom', 500, 234123);
        }
    }

    async deleteMeetingRoom(ROOM_PK: number) {
        let flag = false;

        try {
            await this.createQueryBuilder().delete().where('ROOM_PK = :ROOM_PK', { ROOM_PK }).execute();
            flag = true;
        } catch (err) {
            console.error(err);
            throw new AikoError('meetRoom/deleteMeetingRoom', 500, 595413);
        }

        return flag;
    }

    async updateMeetingRoom(room: MeetRoom) {
        let flag = false;

        try {
            room = propsRemover(room, 'grants', 'meets');

            await this.createQueryBuilder()
                .update(MeetRoom)
                .set({
                    ...room,
                })
                .where('ROOM_PK = :ROOM_PK', { ROOM_PK: room.ROOM_PK })
                .execute();

            flag = true;
        } catch (err) {
            console.error(err);
            throw new AikoError('meetRoom/updateMeetingRoom', 500, 404124);
        }

        return flag;
    }

    async selectOneMeetingRoomWithRoomPK(ROOM_PK: number) {
        try {
            return await this.findOne(ROOM_PK);
        } catch (err) {
            throw new AikoError('meetRoom/selectOneMeetingRoomWithRoomPK', 500, 591845);
        }
    }

    async viewMeetingRoom(ROOM_PK: number) {
        try {
            const room = await this.createQueryBuilder('mr')
                .where('mr.ROOM_PK = :ROOM_PK', { ROOM_PK })
                .leftJoinAndSelect('mr.meets', 'meets')
                .leftJoinAndSelect('meets.members', 'members')
                .leftJoinAndSelect('members.user', 'user')
                .leftJoinAndSelect('user.department', 'department')
                .getOneOrFail();

            room.meets = room.meets.map((meet) => {
                meet.members = meet.members.map((member) => {
                    member.user = propsRemover(
                        member.user,
                        'PASSWORD',
                        'SALT',
                        'IS_DELETED',
                        'IS_VERIFIED',
                        'CREATE_DATE',
                    );

                    return member;
                });

                return meet;
            });

            return room;
        } catch (err) {
            console.error(err);
            throw new AikoError('meetRoom/viewMeetingRoom', 500, 582912);
        }
    }

    async getMeetRoomList(COMPANY_PK: number) {
        try {
            return await this.createQueryBuilder('mr').where('mr.COMPANY_PK = :COMPANY_PK', { COMPANY_PK }).getMany();
        } catch (err) {
            console.error(err);
            throw new AikoError('meetRoom/meetRoomList', 500, 582912);
        }
    }

    async getMeetRoom(ROOM_PK: number) {
        try {
            return await this.createQueryBuilder('mr').where('mr.ROOM_PK = :ROOM_PK', { ROOM_PK }).getOneOrFail();
        } catch (err) {
            console.error(err);
            throw new AikoError('meetRoom/getMeetRoom', 500, 5044911);
        }
    }
}
