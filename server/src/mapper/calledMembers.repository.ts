import { ResultSetHeader } from 'mysql2';
import { CalledMembers } from 'src/entity';
import { getRepo, AikoError } from 'src/Helpers';
import { EntityManager, EntityRepository, InsertResult, Repository, TransactionManager } from 'typeorm';
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
}
