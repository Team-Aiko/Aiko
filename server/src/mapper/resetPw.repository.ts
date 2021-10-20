import { EntityRepository, Repository } from 'typeorm';
import { getConnection } from 'typeorm';
import { ResetPw } from '../entity';
import { IResetPwRepository } from '../interfaces/repositories';
import { User } from '../entity';
import { UserRepository } from '.';
import { InjectRepository } from '@nestjs/typeorm';

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
            return false;
        }
    }

    async getRequest(uuid: string): Promise<ResetPw | undefined> {
        try {
            return await this.createQueryBuilder('r')
                .where('r.UUID = :uuid', { uuid: uuid })
                .orderBy('r.RESET_PK', 'DESC')
                .getOne();
        } catch (err) {
            console.error(err);
            return undefined;
        }
    }

    async removeRequests(userId: number): Promise<boolean> {
        try {
            await this.createQueryBuilder().delete().where('USER_PK = :userPK', { userPK: userId }).execute();
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
}