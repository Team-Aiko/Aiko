import { EntityManager, EntityRepository, Repository, TransactionManager } from 'typeorm';
import { Refresh } from 'src/entity';
import { AikoError } from 'src/Helpers/classes';

@EntityRepository(Refresh)
export default class RefreshRepository extends Repository<Refresh> {
    // 회원가입 시 userpK 생성
    async createRow(@TransactionManager() manager: EntityManager, userPk: number) {
        try {
            return await manager.insert(Refresh, { USER_PK: userPk });
        } catch (err) {
            throw new AikoError('insert error (refresh token table)', 500, 500010);
        }
    }

    // 리프레시 토큰 조회
    async checkRefreshToken(userPk: number) {
        let refresh: string;

        try {
            refresh = (
                await this.createQueryBuilder('r')
                    .select('r.USER_TOKEN')
                    .where('r.USER_PK like :userPk', { userPk: `${userPk}` })
                    .getOne()
            ).USER_TOKEN;
        } catch (error) {
            throw new AikoError('select error (refresh token)', 500, 500004);
        }

        return refresh;
    }

    // 리프레시 토큰 업데이트
    async updateRefreshToken(userPk: number, refreshToken: string) {
        try {
            return await this.createQueryBuilder()
                .update(Refresh)
                .set({ USER_TOKEN: refreshToken })
                .where('USER_PK like :userPk', { userPk: `${userPk}` })
                .execute();
        } catch (err) {
            throw new AikoError('update error(refresh token)', 500, 500006);
        }
    }

    async getRefreshTokenRow(USER_TOKEN: string) {
        try {
            return await this.createQueryBuilder('r').where('r.USER_TOKEN = USER_TOKEN', { USER_TOKEN }).getOneOrFail();
        } catch (err) {
            console.error(err);
            throw new AikoError('refresh/getRefreshTokenRow', 500, 929122);
        }
    }
}
