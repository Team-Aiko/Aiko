import { ResultSetHeader } from 'mysql2';
import { Meet } from 'src/entity';
import { AikoError } from 'src/Helpers';
import { IMeetingBundle } from 'src/interfaces/MVC/meetingMVC';
import { EntityManager, EntityRepository, getConnection, Repository, Transaction, TransactionManager } from 'typeorm';

@EntityRepository(Meet)
export default class MeetRepository extends Repository<Meet> {
    async makeMeetingSchedule(
        info: Omit<Required<IMeetingBundle>, 'MEET_PK' | 'calledMemberList' | 'COMPANY_PK'>,
        @TransactionManager() manager?: EntityManager,
    ) {
        try {
            const { DATE, MAX_MEM_NUM, ROOM_PK, TITLE, DESCRIPTION } = info;

            if (manager) {
                // const meet = new Meet();
                // meet.DATE = DATE;
                // meet.DESCRIPTION = DESCRIPTION;
                // meet.MAX_MEM_NUM = MAX_MEM_NUM;
                // meet.ROOM_PK = ROOM_PK;
                // meet.TITLE = TITLE;

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
            console.error(err);
            throw new AikoError('meet/makeMeetingSchedule', 500, 859234);
        }
    }
}
