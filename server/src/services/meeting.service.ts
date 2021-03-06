import { Injectable } from '@nestjs/common';
import {
    IMeetingBundle,
    IMeetingPagination,
    IMeetingRoomBundle,
    IMeetingSchedulePagination,
} from 'src/interfaces/MVC/meetingMVC';
import { AikoError, getRepo, isChiefAdmin, Pagination, propsRemover, valueChanger } from 'src/Helpers';
import MeetRoomRepository from 'src/mapper/meetRoom.repository';
import { CalledMembers, Grant } from 'src/entity';
import MeetRepository from 'src/mapper/meet.repository';
import { getConnection } from 'typeorm';
import CalledMembersRepository from 'src/mapper/calledMembers.repository';
import { UserRepository } from 'src/mapper';
import { stackAikoError } from 'src/Helpers/functions';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { notSameCompanyError } from 'src/Helpers/instance';

enum meetingServiceError {
    makeMeetingRoom = 1,
    deleteMeetingRoom = 2,
    updateMeetingRoom = 3,
    viewMeetingRoom = 4,
    getMeetRoomList = 5,
    makeMeeting = 6,
    meetingSchedule = 7,
    checkMeetSchedule = 8,
    updateMeeting = 9,
    deleteMeeting = 10,
    checkMeetScheduleForUserInfo = 11,
    finishMeeting = 12,
    todayMeeting = 13,
}

@Injectable()
export default class MeetingService {
    async makeMeetingRoom({ COMPANY_PK, IS_ONLINE, LOCATE, ROOM_NAME, grants }: IMeetingRoomBundle) {
        try {
            // auth filter
            isChiefAdmin(grants);
            return await getRepo(MeetRoomRepository).makeMeetingRoom(COMPANY_PK, IS_ONLINE, LOCATE, ROOM_NAME);
        } catch (err) {
            throw stackAikoError(
                err,
                'MeetingService/makeMeetingRoom',
                500,
                headErrorCode.meet + meetingServiceError.makeMeetingRoom,
            );
        }
    }

    async deleteMeetingRoom(roomId: number, grants: Grant[]) {
        try {
            // auth filter
            isChiefAdmin(grants);

            return await getRepo(MeetRoomRepository).deleteMeetingRoom(roomId);
        } catch (err) {
            throw stackAikoError(
                err,
                'MeetingService/deleteMeetingRoom',
                500,
                headErrorCode.meet + meetingServiceError.deleteMeetingRoom,
            );
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
            throw stackAikoError(
                err,
                'MeetingService/updateMeetingRoom',
                500,
                headErrorCode.meet + meetingServiceError.updateMeetingRoom,
            );
        }
    }

    async viewMeetingRoom(roomId: number) {
        try {
            return await getRepo(MeetRoomRepository).viewMeetingRoom(roomId);
        } catch (err) {
            throw stackAikoError(
                err,
                'MeetingService/viewMeetingRoom',
                500,
                headErrorCode.meet + meetingServiceError.viewMeetingRoom,
            );
        }
    }

    async getMeetRoomList(companyId: number) {
        try {
            return await getRepo(MeetRoomRepository).getMeetRoomList(companyId);
        } catch (err) {
            throw stackAikoError(
                err,
                'MeetingService/getMeetRoomList',
                500,
                headErrorCode.meet + meetingServiceError.getMeetRoomList,
            );
        }
    }

    async makeMeeting({
        DATE,
        MAX_MEM_NUM,
        ROOM_PK,
        TITLE,
        DESCRIPTION,
        calledMemberList,
        COMPANY_PK,
    }: IMeetingBundle) {
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.startTransaction();

        try {
            if (calledMemberList.length > MAX_MEM_NUM) throw new AikoError('exceed maximum member count', 500, -1);

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
            await queryRunner.commitTransaction();

            return { MEET_PK: insertedId, calledPKList: calledList };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw stackAikoError(
                err,
                'MeetingService/makeMeeting',
                500,
                headErrorCode.meet + meetingServiceError.makeMeeting,
            );
        } finally {
            await queryRunner.release();
        }
    }

    async meetingSchedule({ COMPANY_PK, ROOM_PK, currentPage, feedsPerPage, groupCnt }: IMeetingPagination) {
        try {
            const meetRoom = await getRepo(MeetRoomRepository).getMeetRoom(ROOM_PK);
            // company filter
            if (meetRoom.COMPANY_PK !== COMPANY_PK) throw notSameCompanyError;
            const meetingCnt = await getRepo(MeetRepository).meetingCnt(ROOM_PK);
            const pag = new Pagination(currentPage, meetingCnt, feedsPerPage, groupCnt);

            const schedules = await getRepo(MeetRepository).getMeetingSchedules(ROOM_PK, pag);
            return { pagination: pag, schedules: schedules };
        } catch (err) {
            throw stackAikoError(
                err,
                'MeetingService/meetingSchedule',
                500,
                headErrorCode.meet + meetingServiceError.meetingSchedule,
            );
        }
    }

    async checkMeetSchedule({ COMPANY_PK, USER_PK, currentPage, feedsPerPage, groupCnt }: IMeetingSchedulePagination) {
        try {
            const userInfo = await getRepo(UserRepository).getUserInfoWithUserPK(USER_PK);

            // company filter
            if (userInfo.COMPANY_PK !== COMPANY_PK) throw notSameCompanyError;

            const cnt = await getRepo(CalledMembersRepository).getMeetingScheduleCnt(USER_PK);
            const pag = new Pagination(currentPage, cnt, feedsPerPage, groupCnt);

            return { pag, schedules: await getRepo(CalledMembersRepository).checkMeetSchedule(USER_PK, pag) };
        } catch (err) {
            throw stackAikoError(
                err,
                'MeetingService/checkMeetSchedule',
                500,
                headErrorCode.meet + meetingServiceError.checkMeetSchedule,
            );
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
            const calledMembers = await getRepo(CalledMembersRepository).getMeetingMembers(bundle.MEET_PK);

            if (bundle.calledMemberList.length > 0) {
                const remainedMembers = bundle.calledMemberList.filter((userId) => {
                    return calledMembers.some((member) => member.USER_PK === userId);
                });
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

                const totalCnt = bundle.calledMemberList.length;
                const removeCnt = removedMembers.length;
                const newCnt = newMembers.length;

                if (totalCnt - removeCnt - newCnt < 0) throw new AikoError('exceed maximum member count', 500, 930129);

                // add new meeting member process
                insertedIds = await getRepo(CalledMembersRepository).addMeetingMembers(
                    newMembers,
                    bundle.MEET_PK,
                    queryRunner.manager,
                );
            } else if (bundle.calledMemberList.length === 0) {
                await getRepo(CalledMembersRepository).removeMeetingMembers(
                    calledMembers,
                    bundle.MEET_PK,
                    queryRunner.manager,
                );
            }

            await queryRunner.commitTransaction();
            return { flag: true, insertedIds, newMembers, removedMembers };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw stackAikoError(
                err,
                'MeetingService/updateMeeting',
                500,
                headErrorCode.meet + meetingServiceError.updateMeeting,
            );
        } finally {
            await queryRunner.release();
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
                if (!flag) new AikoError('meetingService/deleteMeeting', 500, -1);
                await queryRunner.commitTransaction();
            } else throw notSameCompanyError;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw stackAikoError(
                err,
                'MeetingService/deleteMeeting',
                500,
                headErrorCode.meet + meetingServiceError.deleteMeeting,
            );
        } finally {
            await queryRunner.release();
        }

        return flag;
    }

    async checkMeetScheduleForUserInfo(
        userPK: number,
        currentPage: number,
        feedPerPage?: number,
        pageGroupCnt?: number,
    ) {
        try {
            const scheduleCnt = await getRepo(CalledMembersRepository).getMeetingScheduleCnt(userPK);
            const pagination = new Pagination(currentPage, scheduleCnt, feedPerPage, pageGroupCnt);

            return await getRepo(CalledMembersRepository).checkMeetScheduleForUserInfo(userPK, pagination);
        } catch (err) {
            throw stackAikoError(
                err,
                'MeetingService/checkMeetScheduleForUserInfo',
                500,
                headErrorCode.meet + meetingServiceError.checkMeetScheduleForUserInfo,
            );
        }
    }

    async finishMeeting(finishFlag: boolean, meetPK: number, companyPK: number) {
        try {
            return await getRepo(MeetRepository).finishMeeting(finishFlag, meetPK, companyPK);
        } catch (err) {
            throw stackAikoError(
                err,
                'MeetingService/finishMeeting',
                500,
                headErrorCode.meet + meetingServiceError.finishMeeting,
            );
        }
    }

    async todayMeeting(userPK: number, day: number) {
        try {
            return await getRepo(CalledMembersRepository).todayMeeting(userPK, day);
        } catch (err) {
            throw stackAikoError(
                err,
                'MeetingService/todayMeeting',
                500,
                headErrorCode.meet + meetingServiceError.todayMeeting,
            );
        }
    }
}
