import { GroupChatStorage } from 'src/entity';
import { AikoError } from 'src/Helpers';
import { EntityManager, EntityRepository, Repository, TransactionManager } from 'typeorm';

@EntityRepository(GroupChatStorage)
export default class GroupChatStorageRepository extends Repository<GroupChatStorage> {
    async storeLogsForScheduler(
        logs: {
            GC_PK: number;
            companyPK: number;
            storedLogs: {
                sender: number;
                file: number;
                message: string;
                date: number;
            }[];
        }[],
    ) {
        try {
            await Promise.all(
                logs.map(async (log) => {
                    const { GC_PK, storedLogs } = log;
                    await this.createQueryBuilder()
                        .insert()
                        .into(GroupChatStorage)
                        .values(
                            storedLogs.map((item) => {
                                const { date, file, message, sender } = item;

                                return { GC_PK, CF_PK: file, DATE: date, MESSAGE: message, SENDER: sender };
                            }),
                        )
                        .execute();

                    return true;
                }),
            );
        } catch (err) {
            console.error(err);
            throw new AikoError('GroupChatStorageRepository/storeLogsForScheduler', 500, 129341);
        }
    }
}
