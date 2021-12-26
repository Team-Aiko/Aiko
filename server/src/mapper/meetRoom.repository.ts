import { ResultSetHeader } from 'mysql2';
import { MeetRoom } from 'src/entity';
import { AikoError, propsRemover } from 'src/Helpers';
import { stackAikoError } from 'src/Helpers/functions';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { EntityRepository, Repository } from 'typeorm';

enum meetRoomError {
    makeMeetingRoom = 1,
    deleteMeetingRoom = 2,
    updateMeetingRoom = 3,
    selectOneMeetingRoomWithRoomPK = 4,
    viewMeetingRoom = 5,
    getMeetRoomList = 6,
    getMeetRoom = 7,
}

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
            throw stackAikoError(
                err,
                'meetRoom/makeMeetingRoom',
                500,
                headErrorCode.meetRoomDB + meetRoomError.makeMeetingRoom,
            );
        }
    }

    async deleteMeetingRoom(ROOM_PK: number) {
        let flag = false;

        try {
            await this.createQueryBuilder().delete().where('ROOM_PK = :ROOM_PK', { ROOM_PK }).execute();
            flag = true;
        } catch (err) {
            throw stackAikoError(
                err,
                'meetRoom/deleteMeetingRoom',
                500,
                headErrorCode.meetRoomDB + meetRoomError.deleteMeetingRoom,
            );
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
            throw stackAikoError(
                err,
                'meetRoom/updateMeetingRoom',
                500,
                headErrorCode.meetRoomDB + meetRoomError.updateMeetingRoom,
            );
        }

        return flag;
    }

    async selectOneMeetingRoomWithRoomPK(ROOM_PK: number) {
        try {
            return await this.findOne(ROOM_PK);
        } catch (err) {
            throw stackAikoError(
                err,
                'meetRoom/selectOneMeetingRoomWithRoomPK',
                500,
                headErrorCode.meetRoomDB + meetRoomError.selectOneMeetingRoomWithRoomPK,
            );
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
            throw stackAikoError(
                err,
                'meetRoom/viewMeetingRoom',
                500,
                headErrorCode.meetRoomDB + meetRoomError.viewMeetingRoom,
            );
        }
    }

    async getMeetRoomList(COMPANY_PK: number) {
        try {
            return await this.createQueryBuilder('mr').where('mr.COMPANY_PK = :COMPANY_PK', { COMPANY_PK }).getMany();
        } catch (err) {
            throw stackAikoError(
                err,
                'meetRoom/meetRoomList',
                500,
                headErrorCode.meetRoomDB + meetRoomError.getMeetRoomList,
            );
        }
    }

    async getMeetRoom(ROOM_PK: number) {
        try {
            return await this.createQueryBuilder('mr').where('mr.ROOM_PK = :ROOM_PK', { ROOM_PK }).getOneOrFail();
        } catch (err) {
            throw stackAikoError(
                err,
                'meetRoom/getMeetRoom',
                500,
                headErrorCode.meetRoomDB + meetRoomError.getMeetRoom,
            );
        }
    }
}
