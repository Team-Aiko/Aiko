import { ResultSetHeader } from 'mysql2';
import { Meet } from 'src/entity';
import { AikoError, Pagination, propsRemover, unixTimeStamp } from 'src/Helpers';
import { stackAikoError } from 'src/Helpers/functions';
import { unixTimeEnum } from 'src/interfaces';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { IMeetingBundle } from 'src/interfaces/MVC/meetingMVC';
import { EntityManager, EntityRepository, Repository, TransactionManager } from 'typeorm';

enum meetError {
    makeMeetingSchedule = 1,
    getMeetings = 2,
    getMeeting = 3,
    updateMeeting = 4,
    deleteMeeting = 5,
    meetingCnt = 6,
    getMeetingSchedules = 7,
    finishMeeting = 8,
}

@EntityRepository(Meet)
export default class MeetRepository extends Repository<Meet> {
    async makeMeetingSchedule(
        info: Omit<Required<IMeetingBundle>, 'MEET_PK' | 'calledMemberList' | 'COMPANY_PK'>,
        @TransactionManager() manager?: EntityManager,
    ) {
        try {
            const { DATE, MAX_MEM_NUM, ROOM_PK, TITLE, DESCRIPTION } = info;

            if (manager) {
                const insertResult = await manager.insert(Meet, {
                    DATE,
                    DESCRIPTION,
                    MAX_MEM_NUM,
                    ROOM_PK,
                    TITLE,
                });

                return (insertResult.raw as ResultSetHeader).insertId;
            } else {
                const insertResult = await this.createQueryBuilder()
                    .insert()
                    .into(Meet)
                    .values({ DATE, MAX_MEM_NUM, ROOM_PK, TITLE })
                    .execute();

                return (insertResult.raw as ResultSetHeader).insertId;
            }
        } catch (err) {
            throw stackAikoError(
                err,
                'meet/makeMeetingSchedule',
                500,
                headErrorCode.meetDB + meetError.makeMeetingSchedule,
            );
        }
    }

    async getMeetings(ROOM_PK: number) {
        try {
            const currentTime = unixTimeStamp();

            return await this.createQueryBuilder('m')
                .where('m.ROOM_PK = :ROOM_PK', { ROOM_PK })
                .andWhere('m.DATE <= :DATE', {
                    DATE: currentTime + unixTimeEnum.ONE_MONTH,
                })
                .andWhere('m.DATE > :DATE', { DATE: currentTime })
                .getMany();
        } catch (err) {
            throw stackAikoError(err, 'meet/getMeetings', 500, headErrorCode.meetDB + meetError.getMeetings);
        }
    }

    async getMeeting(MEET_PK: number) {
        try {
            return await this.findOneOrFail(MEET_PK, { relations: ['members'] });
        } catch (err) {
            throw stackAikoError(err, 'meet/getMeeting', 500, headErrorCode.meetDB + meetError.getMeeting);
        }
    }

    async updateMeeting(meeting: Meet, @TransactionManager() manager?: EntityManager) {
        let flag = false;

        try {
            meeting = propsRemover(meeting, 'room', 'members');

            if (manager) {
                await manager.update(Meet, meeting.MEET_PK, meeting);

                flag = true;
            } else {
                await this.createQueryBuilder()
                    .update(Meet)
                    .set(meeting)
                    .where('MEET_PK = :MEET_PK', { MEET_PK: meeting.MEET_PK })
                    .execute();

                flag = true;
            }
        } catch (err) {
            throw stackAikoError(err, 'meet/updateMeeting', 500, headErrorCode.meetDB + meetError.updateMeeting);
        }

        return flag;
    }

    async deleteMeeting(MEET_PK: number, @TransactionManager() manager?: EntityManager) {
        let flag = false;

        try {
            if (manager) {
                const temp = await manager.delete(Meet, { MEET_PK });
                console.log('????????? ?????? ????????? ?????????2?: ', temp);
            } else {
                await this.createQueryBuilder().delete().where('MEET_PK = :MEET_PK', { MEET_PK }).execute();
            }

            flag = true;
        } catch (err) {
            throw stackAikoError(err, 'meet/deleteMeeting', 500, headErrorCode.meetDB + meetError.deleteMeeting);
        }

        return flag;
    }

    /**
     * ?????? ????????? pagination??? ?????? ??? ?????? ???????????? ???????????? ???????????? ?????????
     * @param ROOM_PK
     * @returns
     */
    async meetingCnt(ROOM_PK: number) {
        try {
            return await this.createQueryBuilder('m').where('m.ROOM_PK = :ROOM_PK', { ROOM_PK }).getCount();
        } catch (err) {
            throw stackAikoError(err, 'meet/meetingCnt', 500, headErrorCode.meetDB + meetError.meetingCnt);
        }
    }

    /**
     * ???????????? ?????? ???????????? ?????? ???????????? ???????????? ?????????
     * @param ROOM_PK
     * @param pagination
     */
    async getMeetingSchedules(ROOM_PK: number, pagination: Pagination) {
        try {
            const schedules = await this.createQueryBuilder('m')
                .leftJoinAndSelect('m.members', 'members')
                .leftJoinAndSelect('members.user', 'user')
                .leftJoinAndSelect('user.department', 'department')
                .leftJoinAndSelect('user.profile', 'profile')
                .where('m.ROOM_PK = :ROOM_PK', { ROOM_PK })
                .offset(pagination.offset)
                .limit(pagination.feedPerPage)
                .orderBy('m.MEET_PK', 'DESC')
                .getMany();

            return schedules.map((schedule) => {
                schedule.members = schedule.members.map((member) => {
                    member.user = propsRemover(
                        member.user,
                        'PASSWORD',
                        'SALT',
                        'IS_VERIFIED',
                        'IS_DELETED',
                        'COUNTRY_PK',
                    );

                    return member;
                });

                return schedule;
            });
        } catch (err) {
            throw stackAikoError(
                err,
                'meet/getMeetingSchedules',
                500,
                headErrorCode.meetDB + meetError.getMeetingSchedules,
            );
        }
    }

    async finishMeeting(finishFlag: boolean, MEET_PK: number, COMPANY_PK: number) {
        let flag = false;

        try {
            const meetingInfo = await this.createQueryBuilder('m')
                .leftJoinAndSelect('m.room', 'room')
                .where('room.COMPANY_PK = :COMPANY_PK', { COMPANY_PK })
                .getOneOrFail();
            const isValidExcess = meetingInfo.room.COMPANY_PK === COMPANY_PK;

            if (isValidExcess) {
                await this.createQueryBuilder()
                    .update()
                    .set({ IS_FINISHED: Number(finishFlag) })
                    .where('MEET_PK = :MEET_PK', { MEET_PK })
                    .execute();
                flag = true;
            }
        } catch (err) {
            throw stackAikoError(err, 'meet/finishMeeting', 500, headErrorCode.meetDB + meetError.finishMeeting);
        }

        return flag;
    }
}
