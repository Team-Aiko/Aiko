import { ISignup } from 'src/interfaces';
import { EntityRepository, getConnection, InsertResult, Repository } from 'typeorm';
import { Department, User } from '../entity';
import { propsRemover } from 'src/Helpers/functions';
import { createQueryBuilder } from 'typeorm';

@EntityRepository(User)
export default class UserRepository extends Repository<User> {
    async getUserInfoWithEmail(email: string) {
        return await this.createQueryBuilder('u').where('u.EMAIL = :email', { email: email }).getOneOrFail();
    }

    async getUserInfoWithNickname(nickname: string): Promise<User> {
        let userInfo: User;

        try {
            userInfo = await getConnection()
                .createQueryBuilder(User, 'U')
                .select([
                    'U.FIRST_NAME',
                    'U.LAST_NAME',
                    'U.EMAIL',
                    'U.TEL',
                    'U.COMPANY_PK',
                    'U.DEPARTMENT_PK',
                    'U.PASSWORD',
                    'U.SALT',
                    'U.NICKNAME',
                    'U.USER_PK',
                ])
                .leftJoinAndSelect('U.company', 'company')
                .leftJoinAndSelect('U.department', 'department')
                .where('U.NICKNAME = :nickname', { nickname: nickname })
                .andWhere('U.IS_VERIFIED = :isVerified', { isVerified: 1 })
                .getOneOrFail();
        } catch (err) {
            console.error(err);
        }

        return userInfo;
    }

    async checkDuplicateEmail(email: string) {
        return await this.count({ EMAIL: email });
    }

    async changePassword(userPK: number, hash: string, salt: string) {
        let returnVal = false;

        try {
            await this.createQueryBuilder()
                .update(User)
                .set({ PASSWORD: hash, SALT: salt })
                .where('USER_PK = :userPK', { userPK: userPK })
                .execute();

            returnVal = true;
        } catch (err) {
            console.error(err);
        }

        return returnVal;
    }

    async findNickname(email: string): Promise<User> {
        let returnVal: User;

        try {
            returnVal = await this.createQueryBuilder('u').where('u.EMAIL = :email', { email: email }).getOneOrFail();
        } catch (err) {
            console.error(err);
        }

        return returnVal;
    }

    async getUserInfoWithUserPK(userPK: number, companyPK: number): Promise<User> {
        let user: User;

        try {
            const result = await this.createQueryBuilder('u')
                .leftJoinAndSelect(Department, 'd', 'd.DEPARTMENT_PK = u.DEPARTMENT_PK')
                .where('u.USER_PK =  :userPK', { userPK: userPK })
                .andWhere('u.COMPANY_PK = :companyPK', { companyPK: companyPK })
                .getOne();

            user = propsRemover(result, 'PASSWORD', 'SALT', 'IS_VERIFIED', 'IS_DELETED');
        } catch (err) {
            console.error(err);
            throw err;
        }

        return user;
    }

    async giveAuth(userPK: number): Promise<boolean> {
        let flag = false;

        try {
            getConnection()
                .createQueryBuilder()
                .update(User)
                .set({ IS_VERIFIED: 1 })
                .where('USER_PK = :userPK', { userPK: userPK })
                .execute();

            flag = true;
        } catch (err) {
            console.error(err);
        }

        return flag;
    }

    async createUser(data: ISignup, imageRoute: string, hash: string, salt: string): Promise<InsertResult> {
        let result: InsertResult;

        try {
            result = await this.createQueryBuilder()
                .insert()
                .into(User)
                .values({
                    NICKNAME: data.nickname,
                    PASSWORD: hash,
                    SALT: salt,
                    COMPANY_PK: data.companyPK,
                    DEPARTMENT_PK: data.departmentPK,
                    EMAIL: data.email,
                    FIRST_NAME: data.firstName,
                    LAST_NAME: data.lastName,
                    COUNTRY_PK: data.countryPK,
                    CREATE_DATE: Math.floor(new Date().getTime() / 1000),
                    IS_VERIFIED: 0,
                    IS_DELETED: 0,
                    TEL: data.tel,
                    PROFILE_FILE_NAME: imageRoute,
                })
                .execute();
        } catch (err) {
            console.error(err);
        }

        return result;
    }
    /**
     * companyPK를 이용해 동일한 회사소속의 사원의 리스트를 얻어내는 메소드 (소켓용)
     * @param companyPK
     * @returns UserRepository[]
     */
    async getMembers(companyPK: number): Promise<User[]> {
        let userList: User[] = [];

        try {
            userList = await getConnection()
                .createQueryBuilder(User, 'U')
                .select([
                    'U.USER_PK',
                    'U.DEPARTMENT_PK',
                    'U.FIRST_NAME',
                    'U.LAST_NAME',
                    'U.NICKNAME',
                    'D.DEPARTMENT_NAME',
                ])
                .leftJoinAndSelect('U.socket', 'S')
                .leftJoinAndSelect('U.company', 'C')
                .where('U.COMPANY_PK = COMPANY_PK', { COMPANY_PK: companyPK })
                .andWhere('C.COMPANY_PK = COMPANY_PK', { COMPANY_PK: companyPK })
                .andWhere('S.USER_PK = U.USER_PK')
                .getMany();
        } catch (err) {
            console.error(err);
            throw err;
        }

        return userList;
    }

    // 리프레시 토큰 조회
    checkRefreshToken(refreshToekn) {
        const result = this.createQueryBuilder('u')
            .select('u.REFRESH_TOKEN')
            .where('u.REFRESH_TOKEN like :refreshToken', { refreshToekn: `${refreshToekn}` });
    }
}
