import { EntityRepository, getConnection, Repository } from 'typeorm';

import { LoginAuth } from '../entity';

@EntityRepository(LoginAuth)
export default class LoginAuthRepository extends Repository<LoginAuth> {
    async findUser(uuid: string): Promise<LoginAuth> {
        let row: LoginAuth;

        try {
            row = await this.createQueryBuilder('l').where('l.UUID = uuid', { uuid: uuid }).getOne();
        } catch (err) {
            console.error(err);
        }

        return row;
    }
    async createNewRow(uuid: string, userPK: number): Promise<boolean> {
        let flag = false;

        try {
            await this.createQueryBuilder('l')
                .insert()
                .into(LoginAuth)
                .values({ USER_PK: userPK, UUID: uuid })
                .execute();

            flag = true;
        } catch (err) {
            console.error(err);
        }

        return flag;
    }
}
