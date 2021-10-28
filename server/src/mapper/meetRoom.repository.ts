import { ResultSetHeader } from 'mysql2';
import { MeetRoom } from 'src/entity';
import { AikoError, propsRemover } from 'src/Helpers';
import { EntityManager, EntityRepository, getConnection, Repository, Transaction, TransactionManager } from 'typeorm';

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
}
