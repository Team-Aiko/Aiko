import { EntityRepository, Repository } from 'typeorm';
import { Refresh } from 'src/entity';
import { AikoError } from 'src/Helpers/classes';

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
}
