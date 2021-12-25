import { EntityManager, EntityRepository, Repository, TransactionManager } from 'typeorm';
import { Refresh } from 'src/entity';
import { AikoError } from 'src/Helpers/classes';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';

enum refreshError {
    createRow = 1,
    checkRefreshToken = 2,
    updateRefreshToken = 3,
    getRefreshTokenRow = 4,
}

@EntityRepository(Refresh)
export default class RefreshRepository extends Repository<Refresh> {
    // 회원가입 시 userpK 생성
    async createRow(@TransactionManager() manager: EntityManager, userPk: number) {
        try {
            return await manager.insert(Refresh, { USER_PK: userPk });
        } catch (err) {
            console.error(err);
            throw new AikoError(
                'insert error (refresh token table)',
                500,
                headErrorCode.refreshDB + refreshError.createRow,
            );
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
            console.error(error);
            throw new AikoError(
                'select error (refresh token)',
                500,
                headErrorCode.refreshDB + refreshError.checkRefreshToken,
            );
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
            console.error(err);
            throw new AikoError(
                'update error(refresh token)',
                500,
                headErrorCode.refreshDB + refreshError.updateRefreshToken,
            );
        }
    }

    async getRefreshTokenRow(USER_TOKEN: string) {
        try {
            return await this.createQueryBuilder('r').where('r.USER_TOKEN = USER_TOKEN', { USER_TOKEN }).getOneOrFail();
        } catch (err) {
            console.error(err);
            throw new AikoError(
                'refresh/getRefreshTokenRow',
                500,
                headErrorCode.refreshDB + refreshError.getRefreshTokenRow,
            );
        }
    }
}
