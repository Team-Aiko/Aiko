import { EntityRepository, Repository } from 'typeorm';
import { ResetPw } from '../entity';
import { AikoError } from 'src/Helpers/classes';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { stackAikoError } from 'src/Helpers/functions';

enum ResetPwError {
    getRequestCount = 1,
    insertRequestLog = 2,
    getRequest = 3,
    removeRequests = 4,
}

@EntityRepository(ResetPw)
export default class ResetPwRepository extends Repository<ResetPw> {
    async getRequestCount(userPK: number): Promise<number> {
        try {
        } catch (err) {
            throw stackAikoError(
                err,
                'ResetPwRepository/getRequestCount',
                500,
                headErrorCode.resetPWDB + ResetPwError.getRequestCount,
            );
        }
        return await this.createQueryBuilder('r').where('r.USER_PK = USER_PK', { USER_PK: userPK }).getCount();
    }

    async insertRequestLog(userPK: number, uuid: string): Promise<boolean> {
        try {
            await this.createQueryBuilder().insert().into(ResetPw).values({ USER_PK: userPK, UUID: uuid }).execute();
            return true;
        } catch (err) {
            throw stackAikoError(
                err,
                'resetPw/insertRequestLog',
                500,
                headErrorCode.resetPWDB + ResetPwError.insertRequestLog,
            );
        }
    }

    async getRequest(uuid: string): Promise<ResetPw | undefined> {
        try {
            return await this.createQueryBuilder('r')
                .where('r.UUID = :UUID', { UUID: uuid })
                .orderBy('r.RESET_PK', 'DESC')
                .getOne();
        } catch (err) {
            throw stackAikoError(err, 'resetPw/getRequest', 500, headErrorCode.resetPWDB + ResetPwError.getRequest);
        }
    }

    async removeRequests(userId: number): Promise<boolean> {
        try {
            await this.createQueryBuilder().delete().where('USER_PK = :USER_PK', { USER_PK: userId }).execute();
            return true;
        } catch (err) {
            throw stackAikoError(
                err,
                'resetPw/removeRequests',
                500,
                headErrorCode.resetPWDB + ResetPwError.removeRequests,
            );
        }
    }
}
