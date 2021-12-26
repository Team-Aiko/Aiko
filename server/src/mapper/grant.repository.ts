import Grant from 'src/entity/Grant.entity';
import { AikoError } from 'src/Helpers/classes';
import { stackAikoError } from 'src/Helpers/functions';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { EntityManager, EntityRepository, Repository, TransactionManager } from 'typeorm';

enum grantError {
    grantPermission = 1,
    getGrantList = 2,
}

@EntityRepository(Grant)
export default class GrantRepository extends Repository<Grant> {
    async grantPermission(authNum: number, userPK: number, @TransactionManager() manager?: EntityManager) {
        try {
            if (manager) return await manager.insert(Grant, { AUTH_LIST_PK: authNum, USER_PK: userPK });
            else
                return await this.createQueryBuilder()
                    .insert()
                    .into(Grant)
                    .values({
                        AUTH_LIST_PK: authNum,
                        USER_PK: userPK,
                    })
                    .execute();
        } catch (err) {
            throw stackAikoError(err, 'grantPermission error', 500, headErrorCode.grantDB + grantError.grantPermission);
        }
    }

    async getGrantList(userPK: number) {
        try {
            return await this.createQueryBuilder('g').where('g.USER_PK = :USER_PK', { USER_PK: userPK }).getMany();
        } catch (err) {
            throw stackAikoError(
                err,
                'grantInfo selection error',
                500,
                headErrorCode.grantDB + grantError.getGrantList,
            );
        }
    }
}
