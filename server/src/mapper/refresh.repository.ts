import { EntityRepository, Repository } from 'typeorm';
import { Refresh } from 'src/entity';

@EntityRepository(Refresh)
export default class RefreshRepository extends Repository<Refresh> {
    // 회원가입 시 userpK 생성
    createRow(userPk: number) {
        try {
            return this.createQueryBuilder().insert().into(Refresh).values({ USER_PK: userPk }).execute();
        } catch (err) {
            console.log(err);
        }
    }

    // 리프레시 토큰 조회

    async checkRefreshToken(userPk: number) {
        const result = await this.createQueryBuilder('r')
            .select('r.USER_TOKEN')
            .where('r.USER_PK like :userPk', { userPk: `${userPk}` })
            .getOne();
        return result.USER_TOKEN;
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
            console.log(err);
            throw err;
        }
    }
}
