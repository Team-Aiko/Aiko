import { AikoError } from 'src/Helpers/classes';
import { EntityManager, EntityRepository, Repository, TransactionManager } from 'typeorm';

import { LoginAuth } from '../entity';

@EntityRepository(LoginAuth)
export default class LoginAuthRepository extends Repository<LoginAuth> {
    async findUser(uuid: string): Promise<LoginAuth> {
        let row: LoginAuth;

        try {
            row = await this.createQueryBuilder('l').where('l.UUID = :UUID', { UUID: uuid }).getOneOrFail();
        } catch (err) {
            throw new AikoError('select error(finduser-loginAuth)', 500, 500025);
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
            throw new AikoError('loginAuth/createNewRow', 500, 500360);
        }

        return flag;
    }
}
