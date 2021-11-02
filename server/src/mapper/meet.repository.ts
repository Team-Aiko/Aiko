import { ResultSetHeader } from 'mysql2';
import { Meet } from 'src/entity';
import { AikoError, propsRemover, unixTimeStamp } from 'src/Helpers';
import { unixTimeEnum } from 'src/interfaces';
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
            console.error(err);
            throw new AikoError('meet/getMeetings', 500, 459858);
        }
    }

    async getMeeting(MEET_PK: number) {
        try {
            return await this.findOneOrFail(MEET_PK, { relations: ['members'] });
        } catch (err) {
            console.error(err);
            throw new AikoError('meet/getMeeting', 500, 584921);
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
            console.error(err);
            throw new AikoError('meet/updateMeeting', 500, 589231);
        }

        return flag;
    }

    async deleteMeeting(MEET_PK: number, @TransactionManager() manager?: EntityManager) {
        let flag = false;

        try {
            const fracture = manager ? manager.createQueryBuilder(Meet, 'm') : this.createQueryBuilder();
            await fracture.delete().where('MEET_PK = :MEET_PK', { MEET_PK }).execute();
            flag = true;
        } catch (err) {
            console.error(err);
            throw new AikoError('meet/deleteMeeting', 500, 859312);
        }

        return flag;
    }
}
