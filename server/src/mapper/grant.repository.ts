import Grant from 'src/entity/Grant.entity';
import { AikoError } from 'src/Helpers/classes';
import { EntityManager, EntityRepository, InsertResult, Repository, Transaction, TransactionManager } from 'typeorm';

@EntityRepository(Grant)
export default class GrantRepository extends Repository<Grant> {
    async grantPermission(@TransactionManager() manager: EntityManager, authNum: number, userPK: number) {
        try {
            return await manager.insert(Grant, { AUTH_LIST_PK: authNum, USER_PK: userPK });
        } catch (err) {
            console.error(err);
            throw new AikoError('grantPermission error', 500, 500008);
        }
    }
}
