import { ResultSetHeader } from 'mysql2';
import { CalledMembers } from 'src/entity';
import { getRepo, AikoError, Pagination, propsRemover } from 'src/Helpers';
import { stackAikoError } from 'src/Helpers/functions';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { EntityManager, EntityRepository, Repository, TransactionManager } from 'typeorm';
import { UserRepository } from '.';

enum calledMemberError {
    addMeetingMember = 1,
    checkMeetSchedule = 2,
    getMeetingMembers = 3,
    removeMeetingMembers = 4,
    addMeetingMembers = 5,
    deleteMeetingMembers = 6,
    getMeetingScheduleCnt = 7,
    checkMeetScheduleForUserInfo = 8,
}

@EntityRepository(CalledMembers)
export default class CalledMembersRepository extends Repository<CalledMembers> {
    async addMeetingMember(
        memberList: number[],
        COMPANY_PK: number,
        MEET_PK: number,
        @TransactionManager() manager?: EntityManager,
    ) {
        try {
            const refinedUser = await Promise.all(
                memberList.map(async (memberPK) => {
                    const user = await getRepo(UserRepository).getUserInfoWithUserPK(memberPK);
                    if (COMPANY_PK === user.COMPANY_PK) return user.USER_PK;
                }),
            );

            if (manager) {
                return Promise.all(
                    refinedUser.map(async (member) => {
                        const insertResult = await this.manager.insert(CalledMembers, {
                            MEET_PK,
                            USER_PK: member,
                        });
                        return (insertResult.raw as ResultSetHeader).insertId;
                    }),
                );
            } else {
                return Promise.all(
                    refinedUser.map(async (member) => {
                        const insertResult = await this.createQueryBuilder()
                            .insert()
                            .into(CalledMembers)
                            .values({
                                MEET_PK,
                                USER_PK: member,
                            })
                            .execute();
                        return (insertResult.raw as ResultSetHeader).insertId;
                    }),
                );
            }
        } catch (err) {
            throw stackAikoError(
                err,
                'calledMembers/addMeetingMember',
                500,
                headErrorCode.calledMembersDB + calledMemberError.addMeetingMember,
            );
        }
    }

    async checkMeetSchedule(USER_PK: number, pag: Pagination) {
        try {
            const meetings = (
                await this.createQueryBuilder('c')
                    .leftJoinAndSelect('c.meet', 'meet')
                    .leftJoinAndSelect('meet.room', 'room')
                    .leftJoinAndSelect('meet.members', 'members')
                    .leftJoinAndSelect('members.user', 'user')
                    .leftJoinAndSelect('user.profile', 'profile')
                    .leftJoinAndSelect('user.department', 'department')
                    .where('c.USER_PK = :USER_PK', { USER_PK })
                    .offset(pag.offset)
                    .limit(pag.feedPerPage)
                    .orderBy('c.CALL_PK', 'DESC')
                    .getMany()
            ).map((calledMember) => calledMember.meet);

            return meetings.map((meeting) => {
                meeting.members = meeting.members.map((member) => {
                    member.user = propsRemover(
                        member.user,
                        'PASSWORD',
                        'SALT',
                        'COUNTRY_PK',
                        'CREATE_DATE',
                        'IS_DELETED',
                        'IS_VERIFIED',
                    );
                    return member;
                });

                return meeting;
            });
        } catch (err) {
            throw stackAikoError(
                err,
                'calledMembers/checkMeetSchedule',
                500,
                headErrorCode.calledMembersDB + calledMemberError.checkMeetSchedule,
            );
        }
    }

    async getMeetingMembers(MEET_PK: number) {
        try {
            return await this.createQueryBuilder('c').where('c.MEET_PK = :MEET_PK', { MEET_PK }).getMany();
        } catch (err) {
            throw stackAikoError(
                err,
                'calledMembers/getMeetingMembers',
                500,
                headErrorCode.calledMembersDB + calledMemberError.getMeetingMembers,
            );
        }
    }

    async removeMeetingMembers(
        members: CalledMembers[],
        MEET_PK: number,
        @TransactionManager() manager?: EntityManager,
    ) {
        try {
            const func = async (member: CalledMembers) => {
                if (manager) {
                    return await manager
                        .createQueryBuilder(CalledMembers, 'c')
                        .delete()
                        .where('USER_PK = :USER_PK', { USER_PK: member.USER_PK })
                        .andWhere('MEET_PK = :MEET_PK', { MEET_PK })
                        .execute();
                } else {
                    return await this.createQueryBuilder('c')
                        .delete()
                        .where('c.USER_PK = :', { USER_PK: member.USER_PK })
                        .andWhere('c.MEET_PK = :MEET_PK', { MEET_PK })
                        .execute();
                }
            };

            const results = await Promise.all(members.map(func));
            const affectedList = results.map((result) => result.affected);

            return affectedList;
        } catch (err) {
            throw stackAikoError(
                err,
                'calledMembers/removeMeetingMembers',
                500,
                headErrorCode.calledMembersDB + calledMemberError.removeMeetingMembers,
            );
        }
    }

    async addMeetingMembers(newMembers: number[], MEET_PK: number, @TransactionManager() manager?: EntityManager) {
        try {
            const cb = async (USER_PK: number) => {
                if (manager) {
                    const insrtResults = await manager
                        .createQueryBuilder()
                        .insert()
                        .into(CalledMembers)
                        .values({
                            MEET_PK,
                            USER_PK,
                        })
                        .execute();
                    return (insrtResults.raw as ResultSetHeader).insertId;
                } else {
                    const insrtResults = await this.createQueryBuilder()
                        .insert()
                        .into(CalledMembers)
                        .values({
                            MEET_PK,
                            USER_PK,
                        })
                        .execute();
                    return (insrtResults.raw as ResultSetHeader).insertId;
                }
            };

            const insrtedIds = await Promise.all(newMembers.map(cb));
            return insrtedIds;
        } catch (err) {
            throw stackAikoError(
                err,
                'calledMembers/addMeetingMembers',
                500,
                headErrorCode.calledMembersDB + calledMemberError.addMeetingMembers,
            );
        }
    }

    async deleteMeetingMembers(MEET_PK: number, @TransactionManager() manager?: EntityManager) {
        let flag = false;

        try {
            if (manager) {
                const temp = await manager.delete(CalledMembers, { MEET_PK });
                console.log('소소님 이거 어떻게 찍혀요1?: ', temp);
            } else {
                await this.createQueryBuilder().where('MEET_PK = :MEET_PK', { MEET_PK }).execute();
            }

            flag = true;
        } catch (err) {
            throw stackAikoError(
                err,
                'calledMembers/deleteMeetingMembers',
                500,
                headErrorCode.calledMembersDB + calledMemberError.deleteMeetingMembers,
            );
        }

        return flag;
    }

    async getMeetingScheduleCnt(USER_PK: number) {
        try {
            return await this.createQueryBuilder('c').where('c.USER_PK = :USER_PK', { USER_PK }).getCount();
        } catch (err) {
            throw stackAikoError(
                err,
                'CalledMembersRepository/getMeetingScheduleCnt',
                500,
                headErrorCode.calledMembersDB + calledMemberError.getMeetingScheduleCnt,
            );
        }
    }

    async checkMeetScheduleForUserInfo(USER_PK: number, pagination: Pagination) {
        try {
            return await this.createQueryBuilder('c')
                .where('c.USER_PK = :"USER_PK', { USER_PK })
                .offset(pagination.offset)
                .limit(pagination.feedPerPage)
                .orderBy('c.MEET_PK', 'DESC')
                .getMany();
        } catch (err) {
            throw stackAikoError(
                err,
                'calledMembers/checkMeetScheduleForUserInfo',
                500,
                headErrorCode.calledMembersDB + calledMemberError.checkMeetScheduleForUserInfo,
            );
        }
    }
}
