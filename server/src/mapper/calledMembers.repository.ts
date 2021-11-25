import { ResultSetHeader } from 'mysql2';
import { throwIfEmpty } from 'rxjs';
import { CalledMembers } from 'src/entity';
import { getRepo, AikoError, unixTimeStamp, Pagination } from 'src/Helpers';
import { unixTimeEnum } from 'src/interfaces';
import { IMeetingPagination } from 'src/interfaces/MVC/meetingMVC';
import {
    Brackets,
    DeleteResult,
    EntityManager,
    EntityRepository,
    InsertResult,
    Repository,
    SelectQueryBuilder,
    TransactionManager,
} from 'typeorm';
import { UserRepository } from '.';

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
            console.error(err);
            throw new AikoError('calledMembers/addMeetingMember', 500, 492812);
        }
    }

    async checkMeetSchedule(USER_PK: number, pag: Pagination) {
        try {
            const currentTime = unixTimeStamp();

            return await this.createQueryBuilder('c')
                .leftJoinAndSelect('c.meet', 'meet')
                .where('USER_PK = :USER_PK', { USER_PK })
                .andWhere(
                    new Brackets((qb) => {
                        qb.where('meet.DATE <= :DATE1', { DATE1: currentTime + unixTimeEnum.ONE_MONTH }).andWhere(
                            'meet.DATE > :DATE2',
                            { DATE2: currentTime },
                        );
                    }),
                )
                .offset(pag.offset)
                .limit(pag.feedPerPage)
                .orderBy('c.CALL_PK', 'DESC')
                .getMany();
        } catch (err) {
            console.error(err);
            throw new AikoError('calledMembers/checkMeetSchedule', 500, 549231);
        }
    }

    async getMeetingMembers(MEET_PK: number) {
        try {
            return await this.createQueryBuilder('c').where('c.MEET_PK = :MEET_PK', { MEET_PK }).getMany();
        } catch (err) {
            console.error(err);
            throw new AikoError('calledMembers/getMeetingMembers', 500, 594391);
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
            console.error(err);
            throw new AikoError('calledMembers/removeMeetingMembers', 500, 495013);
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
            console.error(err);
            throw new AikoError('calledMembers/addMeetingMembers', 500, 591202);
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
            console.error(err);
            throw new AikoError('calledMembers/deleteMeetingMembers', 500, 591027);
        }

        return flag;
    }

    async getMeetingScheduleCnt(USER_PK: number) {
        try {
            return await this.createQueryBuilder('c').where('c.USER_PK = :USER_PK', { USER_PK }).getCount();
        } catch (err) {
            console.error(err);
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
            console.error(err);
            throw new AikoError('calledMembers/checkMeetScheduleForUserInfo', 500, 281291);
        }
    }
}
