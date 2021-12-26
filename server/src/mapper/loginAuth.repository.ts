import { AikoError } from 'src/Helpers/classes';
import { stackAikoError } from 'src/Helpers/functions';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { EntityManager, EntityRepository, Repository, TransactionManager } from 'typeorm';

import { LoginAuth } from '../entity';

enum loginAuthError {
    findUser = 1,
    createNewRow = 2,
}

@EntityRepository(LoginAuth)
export default class LoginAuthRepository extends Repository<LoginAuth> {
    async findUser(uuid: string): Promise<LoginAuth> {
        let row: LoginAuth;

        try {
            row = await this.createQueryBuilder('l').where('l.UUID = :UUID', { UUID: uuid }).getOneOrFail();
        } catch (err) {
            throw stackAikoError(
                err,
                'select error(finduser-loginAuth)',
                500,
                headErrorCode.loginAuthDB + loginAuthError.findUser,
            );
        }

        return row;
    }
    async createNewRow(@TransactionManager() manager: EntityManager, uuid: string, userPK: number): Promise<boolean> {
        let flag = false;

        try {
            const loginAuth = new LoginAuth();
            loginAuth.USER_PK = userPK;
            loginAuth.UUID = uuid;
            await manager.insert(LoginAuth, loginAuth);

            flag = true;
        } catch (err) {
            throw stackAikoError(
                err,
                'loginAuth/createNewRow',
                500,
                headErrorCode.loginAuthDB + loginAuthError.createNewRow,
            );
        }

        return flag;
    }
}
