import { EntityManager, EntityRepository, InsertResult, Repository, TransactionManager } from 'typeorm';
import { unixTimeStamp, propsRemover, stackAikoError } from 'src/Helpers/functions';
import { AikoError } from 'src/Helpers';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import SocketToken from 'src/entity/socketToken.entity';

enum socketTokenError {
    insertSocketToken = 1,
    decodeSocketToken = 2,
}

@EntityRepository(SocketToken)
export default class SocketTokenRepository extends Repository<SocketToken> {
    async insertSocketToken(USER_PK: number, COMPANY_PK: number, TOKEN_STR: string) {
        try {
            const DATE = unixTimeStamp();
            const dto: Partial<SocketToken> = {
                USER_PK,
                COMPANY_PK,
                TOKEN_STR,
                DATE,
            };

            await this.insert(dto);
        } catch (err) {
            throw stackAikoError(
                err,
                'SocketTokenRepository/insertSocketToken',
                500,
                headErrorCode.account + socketTokenError.insertSocketToken,
            );
        }
    }

    async decodeSocketToken(socketToken: string) {
        try {
            const result = await this.createQueryBuilder()
                .where('TOKEN_STR = :socketToken', { socketToken })
                .getOneOrFail();

            await this.delete(result.TOKEN_PK);

            return result;
        } catch (err) {
            throw stackAikoError(
                err,
                'SocketTokenRepository/decodeSocketToken',
                500,
                headErrorCode.account + socketTokenError.decodeSocketToken,
            );
        }
    }
}
