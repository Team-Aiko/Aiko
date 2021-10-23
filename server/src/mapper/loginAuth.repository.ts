import { EntityManager, EntityRepository, getConnection, Repository, Transaction, TransactionManager } from 'typeorm';

import { LoginAuth } from '../entity';

@EntityRepository(LoginAuth)
export default class LoginAuthRepository extends Repository<LoginAuth> {
    async findUser(uuid: string): Promise<LoginAuth> {
        let row: LoginAuth;

        try {
            row = await this.createQueryBuilder('l').where('l.UUID = :UUID', { UUID: uuid }).getOne();
        } catch (err) {
            console.error(err);
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
            console.error(err);
        }

        return flag;
    }
}
