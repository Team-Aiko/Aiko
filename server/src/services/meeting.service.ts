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

    async checkMeetSchedule(userId: number) {
        try {
            return await getRepo(CalledMembersRepository).checkMeetSchedule(userId);
        } catch (err) {
            throw err;
        }
    }

    async updateMeeting(bundle: IMeetingBundle) {
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.startTransaction();

        try {
            let meeting = await getRepo(MeetRepository).getMeeting(bundle.MEET_PK);
            Object.keys(bundle).forEach((prop) => {
                meeting = valueChanger(bundle[prop], meeting, prop);
            });
            // update meeting info
            await getRepo(MeetRepository).updateMeeting(meeting, queryRunner.manager);
            const calledMembers = await getRepo(CalledMembersRepository).getMeetingMembers(bundle.MEET_PK);
            const remainedMembers = bundle.calledMemberList.filter((userId) => {
                return calledMembers.some((member) => member.USER_PK === userId);
            });
            const removedMembers = bundle.calledMemberList.filter((userId) => {
                const temp = remainedMembers.map((remainedId) => !(remainedId === userId));
                return temp.reduce((prev, curr) => prev || curr, false);
            });

            // remove meeting member process
            const affectedList = await getRepo(CalledMembersRepository).removeMeetingMembers(
                removedMembers,
                bundle.MEET_PK,
                queryRunner.manager,
            );
            const removeIndx = affectedList.map((curr, idx) => {
                if (curr) {
                    return idx;
                }
            });
            const newMember = removedMembers.filter((curr, idx) => {
                const temp = removeIndx.map((ridx) => idx === ridx); // 같은 인덱스가 있으면 true 없으면 false
                return !temp.reduce((prev, curr) => prev || curr, false); // 종합결과 스캔됐으면 false 안됐으면 true
            });

            // add meeting member process
            const insertedIds = await getRepo(CalledMembersRepository).addMeetingMembers(
                newMember,
                bundle.MEET_PK,
                queryRunner.manager,
            );

            queryRunner.commitTransaction();
            return { flag: true, insertedIds, newMember, removedMembers };
        } catch (err) {
            queryRunner.rollbackTransaction();
            throw err;
        } finally {
            queryRunner.release();
        }
    }
}
