import { Injectable } from '@nestjs/common';
import { IMeetingBundle, IMeetingRoomBundle } from 'src/interfaces/MVC/meetingMVC';
import { AikoError, getRepo, isChiefAdmin, propsRemover, valueChanger } from 'src/Helpers';
import MeetRoomRepository from 'src/mapper/meetRoom.repository';
import { CalledMembers, Grant, MeetRoom } from 'src/entity';
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
        let insertedIds: number[] = [];
        let newMembers: number[] = [];
        let removedMembers: CalledMembers[] = [];

        try {
            // update meeting info process
            let meeting = await getRepo(MeetRepository).getMeeting(bundle.MEET_PK);
            Object.keys(bundle).forEach((prop) => {
                meeting = valueChanger(bundle[prop], meeting, prop);
            });
            await getRepo(MeetRepository).updateMeeting(meeting, queryRunner.manager);

            // schedule member update process
            if (bundle.calledMemberList.length > 0) {
                const calledMembers = await getRepo(CalledMembersRepository).getMeetingMembers(bundle.MEET_PK);
                console.log(
                    '🚀 ~ file: meeting.service.ts ~ line 131 ~ MeetingService ~ updateMeeting ~ calledMembers',
                    calledMembers,
                );
                const remainedMembers = bundle.calledMemberList.filter((userId) => {
                    return calledMembers.some((member) => member.USER_PK === userId);
                });
                console.log(
                    '🚀 ~ file: meeting.service.ts ~ line 138 ~ MeetingService ~ remainedMembers ~ remainedMembers',
                    remainedMembers,
                );
                removedMembers = calledMembers.filter((calledMember) => {
                    let flag = false;

                    bundle.calledMemberList.forEach((userId) => {
                        flag = flag ? flag : calledMember.USER_PK === userId;
                    });

                    return !flag;
                });

                // remove meeting member
                const affectedList = await getRepo(CalledMembersRepository).removeMeetingMembers(
                    removedMembers,
                    bundle.MEET_PK,
                    queryRunner.manager,
                );

                newMembers = bundle.calledMemberList.filter((userId) => {
                    let flag = false;

                    remainedMembers.forEach((remainedMember) => {
                        flag = flag ? flag : remainedMember === userId;
                    });

                    removedMembers.forEach((removedMembers) => {
                        flag = flag ? flag : removedMembers.USER_PK === userId;
                    });

                    return !flag;
                });

                // add new meeting member process
                insertedIds = await getRepo(CalledMembersRepository).addMeetingMembers(
                    newMembers,
                    bundle.MEET_PK,
                    queryRunner.manager,
                );
            }

            queryRunner.commitTransaction();
            return { flag: true, insertedIds, newMembers, removedMembers };
        } catch (err) {
            queryRunner.rollbackTransaction();
            throw err;
        } finally {
            queryRunner.release();
        }
    }
    async deleteMeeting(meetPK: number, COMPANY_PK: number) {
        let flag = false;
        const queryRunner = getConnection().createQueryRunner();
        const { manager } = queryRunner;
        await queryRunner.startTransaction();

        try {
            const meeting = await getRepo(MeetRepository).getMeeting(meetPK);
            const room = await getRepo(MeetRoomRepository).getMeetRoom(meeting.ROOM_PK);

            if (room.COMPANY_PK === COMPANY_PK) {
                const flag1 = await getRepo(CalledMembersRepository).deleteMeetingMembers(meetPK, manager);
                const flag2 = await getRepo(MeetRepository).deleteMeeting(meetPK, manager);

                flag = flag1 && flag2;
                if (!flag) new AikoError('meetingService/deleteMeeting', 500, 839192);
                queryRunner.commitTransaction();
            } else throw new AikoError('meetingService/invalidEmployee', 500, 839193);
        } catch (err) {
            queryRunner.rollbackTransaction();
            throw err;
        } finally {
            queryRunner.release();
        }

        return flag;
    }
}
