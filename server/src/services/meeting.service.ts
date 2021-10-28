import { Injectable } from '@nestjs/common';
import { IMeetingBundle, IMeetingRoomBundle } from 'src/interfaces/MVC/meetingMVC';
import { AikoError, getRepo, isChiefAdmin, propsRemover, valueChanger } from 'src/Helpers';
import MeetRoomRepository from 'src/mapper/meetRoom.repository';
import { Grant, MeetRoom } from 'src/entity';
import MeetRepository from 'src/mapper/meet.repository';
import { getConnection } from 'typeorm';
import CalledMembersRepository from 'src/mapper/calledMembers.repository';

@Injectable()
export default class MeetingService {
    async makeMeetingRoom(bundle: IMeetingRoomBundle) {
        try {
            // auth filter
            isChiefAdmin(bundle.grants);
            return await getRepo(MeetRoomRepository).makeMeetingRoom(
                bundle.COMPANY_PK,
                bundle.IS_ONLINE,
                bundle.LOCATE,
                bundle.ROOM_NAME,
            );
        } catch (err) {
            throw err;
        }
    }
    async deleteMeetingRoom(roomId: number, grants: Grant[]) {
        try {
            // auth filter
            isChiefAdmin(grants);

            return await getRepo(MeetRoomRepository).deleteMeetingRoom(roomId);
        } catch (err) {
            throw err;
        }
    }

    async updateMeetingRoom(bundle: IMeetingRoomBundle) {
        try {
            // auth filter
            isChiefAdmin(bundle.grants);
            let room = await getRepo(MeetRoomRepository).selectOneMeetingRoomWithRoomPK(bundle.ROOM_PK);
            // remove useless props
            bundle = propsRemover(bundle, 'grants');
            // value change process
            Object.keys(bundle).forEach((prop) => {
                room = valueChanger(bundle[prop], room, prop);
            });
            // remove useless props
            room = propsRemover(room, 'meets');

            return await getRepo(MeetRoomRepository).updateMeetingRoom(room);
        } catch (err) {
            throw err;
        }
    }

    async viewMeetingRoom(roomId: number) {
        try {
            return await getRepo(MeetRoomRepository).viewMeetingRoom(roomId);
        } catch (err) {
            throw err;
        }
    }

    async getMeetRoomList(companyId: number) {
        try {
            return await getRepo(MeetRoomRepository).getMeetRoomList(companyId);
        } catch (err) {
            throw err;
        }
    }

    async makeMeeting(bundle: IMeetingBundle) {
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.startTransaction();

        try {
            const { DATE, MAX_MEM_NUM, ROOM_PK, TITLE, DESCRIPTION, calledMemberList, COMPANY_PK } = bundle;
            const partial: Omit<Required<IMeetingBundle>, 'MEET_PK' | 'calledMemberList' | 'COMPANY_PK'> = {
                DATE,
                MAX_MEM_NUM,
                ROOM_PK,
                TITLE,
                DESCRIPTION,
            };

            const insertedId = await getRepo(MeetRepository).makeMeetingSchedule(partial, queryRunner.manager);
            const calledList = await getRepo(CalledMembersRepository).addMeetingMember(
                calledMemberList,
                COMPANY_PK,
                insertedId,
                queryRunner.manager,
            );
            queryRunner.commitTransaction();

            return { MEET_PK: insertedId, calledPKList: calledList };
        } catch (err) {
            queryRunner.rollbackTransaction();
            throw err;
        } finally {
            queryRunner.release();
        }
    }
}
