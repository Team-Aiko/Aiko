import { EntityRepository, Repository } from 'typeorm';
import { getConnection } from 'typeorm';
import { ResetPw } from '../entity';
import { User } from '../entity';
import { UserRepository } from '.';
import { InjectRepository } from '@nestjs/typeorm';
import { AikoError } from 'src/Helpers/classes';

@EntityRepository(ResetPw)
export default class ResetPwRepository extends Repository<ResetPw> {
    async getRequestCount(userPK: number): Promise<number> {
        return await this.createQueryBuilder('r').where('r.USER_PK = USER_PK', { USER_PK: userPK }).getCount();
    }

    async insertRequestLog(userPK: number, uuid: string): Promise<boolean> {
        try {
            await this.createQueryBuilder().insert().into(ResetPw).values({ USER_PK: userPK, UUID: uuid }).execute();
            return true;
        } catch (err) {
            throw new AikoError('resetPw/insertRequestLog', 500, 500356);
        }
    }

    async getRequest(uuid: string): Promise<ResetPw | undefined> {
        try {
            return await this.createQueryBuilder('r')
                .where('r.UUID = :UUID', { UUID: uuid })
                .orderBy('r.RESET_PK', 'DESC')
                .getOne();
        } catch (err) {
            throw new AikoError('resetPw/getRequest', 500, 500355);
        }
    }

    async removeRequests(userId: number): Promise<boolean> {
        try {
            await this.createQueryBuilder().delete().where('USER_PK = :USER_PK', { USER_PK: userId }).execute();
            return true;
        } catch (err) {
            throw new AikoError('resetPw/removeRequests', 500, 500359);
        }
    }
}
