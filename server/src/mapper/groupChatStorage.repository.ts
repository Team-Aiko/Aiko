import { GroupChatStorage } from 'src/entity';
import { AikoError } from 'src/Helpers';
import { stackAikoError } from 'src/Helpers/functions';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { EntityRepository, Repository } from 'typeorm';

enum groupChatStorageError {
    storeLogsForScheduler = 1,
}

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
            throw stackAikoError(
                err,
                'GroupChatStorageRepository/storeLogsForScheduler',
                500,
                headErrorCode.groupChatStroageDB + groupChatStorageError.storeLogsForScheduler,
            );
        }
    }
}
