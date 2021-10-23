import { ISignup } from 'src/interfaces';
import {
    EntityManager,
    EntityRepository,
    getConnection,
    InsertResult,
    Repository,
    TransactionManager,
    Transaction,
} from 'typeorm';
import { Department, User } from '../entity';
import { propsRemover } from 'src/Helpers/functions';

@EntityRepository(User)
export default class UserRepository extends Repository<User> {
    async getUserInfoWithEmail(email: string) {
        return await this.createQueryBuilder('u').where('u.EMAIL = :email', { email: email }).getOneOrFail();
    }

    async getUserInfoWithNickname(nickname: string): Promise<User> {
        let userInfo: User;

        try {
            userInfo = await this.createQueryBuilder('U')
                .leftJoinAndSelect('U.company', 'company')
                .leftJoinAndSelect('U.department', 'department')
                .where('U.NICKNAME = :NICKNAME', { NICKNAME: nickname })
                .andWhere('U.IS_VERIFIED = :IS_VERIFIED', { IS_VERIFIED: 1 })
                .andWhere('U.COMPANY_PK = company.COMPANY_PK')
                .andWhere('U.DEPARTMENT_PK = department.DEPARTMENT_PK')
                .getOneOrFail();
        } catch (err) {
            throw err;
        }

        return userInfo;
    }

    async checkDuplicateEmail(email: string) {
        return await this.count({ EMAIL: email });
    }

    async changePassword(userPK: number, hash: string, salt: string) {
        let returnVal = false;

        try {
            await this.createQueryBuilder('U')
                .update(User)
                .set({ PASSWORD: hash, SALT: salt })
                .where('U.USER_PK = :USER_PK', { USER_PK: userPK })
                .execute();

            returnVal = true;
        } catch (err) {
            throw err;
        }

        return returnVal;
    }

    async findNickname(email: string): Promise<User> {
        let returnVal: User;

        try {
            returnVal = await this.createQueryBuilder('u').where('u.EMAIL = :EMAIL', { EMAIL: email }).getOneOrFail();
        } catch (err) {
            throw err;
        }

        return returnVal;
    }

    async getUserInfoWithUserPK(userPK: number, companyPK: number): Promise<User> {
        let user: User;

        try {
            const result = await this.createQueryBuilder('u')
                .leftJoinAndSelect(Department, 'd', 'd.DEPARTMENT_PK = u.DEPARTMENT_PK')
                .where('u.USER_PK = :USER_PK', { USER_PK: userPK })
                .andWhere('u.COMPANY_PK = :COMPANY_PK', { COMPANY_PK: companyPK })
                .getOne();

            user = propsRemover(result, 'PASSWORD', 'SALT', 'IS_VERIFIED', 'IS_DELETED');
        } catch (err) {
            throw err;
        }

        return user;
    }

    async giveAuth(userPK: number): Promise<boolean> {
        let flag = false;

        try {
            this.createQueryBuilder('U')
                .update(User)
                .set({ IS_VERIFIED: 1 })
                .where('U.USER_PK = :USER_PK', { USER_PK: userPK })
                .execute();

            flag = true;
        } catch (err) {
            throw err;
        }

        return flag;
    }

    async createUser(
        @TransactionManager() manager: EntityManager,
        data: ISignup,
        imageRoute: string,
        hash: string,
        salt: string,
    ): Promise<InsertResult> {
        let result: InsertResult;

        try {
            const user = new User();
            user.COMPANY_PK = data.companyPK;
            user.COUNTRY_PK = data.countryPK;
            user.DEPARTMENT_PK = data.departmentPK;
            user.EMAIL = data.email;
            user.FIRST_NAME = data.firstName;
            user.LAST_NAME = data.lastName;
            user.NICKNAME = data.nickname;
            user.PASSWORD = hash;
            user.SALT = salt;
            user.PROFILE_FILE_NAME = imageRoute;
            user.TEL = data.tel;
            user.CREATE_DATE = Math.floor(new Date().getTime() / 1000);
            user.IS_DELETED = 0;
            user.IS_VERIFIED = 0;

            result = await manager.insert(User, user);
        } catch (err) {
            throw err;
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
                .where('U.COMPANY_PK = :COMPANY_PK', { COMPANY_PK: companyPK })
                .andWhere('C.COMPANY_PK = :COMPANY_PK', { COMPANY_PK: companyPK })
                .andWhere('S.USER_PK = U.USER_PK')
                .getMany();
        } catch (err) {
            throw err;
        }

        return userList;
    }

    async checkDuplicateNickname(nickname: string): Promise<number> {
        try {
            return await this.createQueryBuilder('U')
                .where('U.NICKNAME = :NICKNAME', { NICKNAME: nickname })
                .getCount();
        } catch (err) {
            throw err;
        }
    }
}
