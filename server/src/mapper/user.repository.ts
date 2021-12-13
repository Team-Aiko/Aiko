import { ISignup } from 'src/interfaces/MVC/accountMVC';
import {
    EntityManager,
    EntityRepository,
    getConnection,
    InsertResult,
    Repository,
    TransactionManager,
    Transaction,
    Brackets,
    SelectQueryBuilder,
} from 'typeorm';
import { Department, User, Company, Grant } from '../entity';
import { propsRemover } from 'src/Helpers/functions';
import { createQueryBuilder } from 'typeorm';
import { AikoError } from 'src/Helpers/classes';

const criticalUserInfo: string[] = ['PASSWORD', 'SALT', 'IS_VERIFIED', 'IS_DELETED', 'CREATE_DATE'];

@EntityRepository(User)
export default class UserRepository extends Repository<User> {
    async getUserInfoWithEmail(email: string) {
        try {
            return await this.createQueryBuilder('u').where('u.EMAIL = :email', { email: email }).getOneOrFail();
        } catch (err) {
            throw new AikoError('select error(search userinfo with email)', 500, 500125);
        }
    }

    async getUserInfoWithNickname(
        nickname: string,
        removePW: boolean,
        joinTable: boolean,
        companyPK?: number,
    ): Promise<User> {
        let userInfo: User;
        let fraction: SelectQueryBuilder<User>;
        const removeCols = removePW ? criticalUserInfo : criticalUserInfo.slice(2);

        try {
            fraction = this.createQueryBuilder('U');
            fraction = joinTable
                ? fraction.leftJoinAndSelect('U.company', 'company').leftJoinAndSelect('U.department', 'department')
                : fraction;
            fraction = fraction.where('U.IS_VERIFIED = 1').andWhere(`U.NICKNAME = '${nickname}'`);

            if (companyPK) fraction = fraction.andWhere(`U.COMPANY_PK = ${companyPK}`);

            userInfo = propsRemover(await fraction.getOneOrFail(), ...removeCols);
            console.log('🚀 ~ file: user.repository.ts ~ line 50 ~ UserRepository ~ userInfo', userInfo);
        } catch (err) {
            console.error(err);
            throw new AikoError('select error(search user with nickname)', 500, 500121);
        }

        return userInfo;
    }

    async checkDuplicateEmail(email: string) {
        try {
            return await this.count({ EMAIL: email });
        } catch (err) {
            throw new AikoError('count error (email)', 500, 500019);
        }
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
            throw new AikoError('update error(change password)', 500, 500123);
        }

        return returnVal;
    }

    async findNickname(email: string): Promise<User> {
        let returnVal: User;

        try {
            returnVal = await this.createQueryBuilder('u').where('u.EMAIL = :EMAIL', { EMAIL: email }).getOneOrFail();
        } catch (err) {
            throw new AikoError('select error(search nickname)', 500, 500029);
        }

        return returnVal;
    }

    async getUserInfoWithUserPK(userPK: number): Promise<User> {
        let user: User;

        try {
            const result = await this.findOne({ USER_PK: userPK }, { relations: ['company', 'department', 'grants'] });
            user = propsRemover(result, 'PASSWORD', 'SALT', 'IS_VERIFIED', 'IS_DELETED');
        } catch (err) {
            throw new AikoError('select error (user information)', 500, 500012);
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
            throw new AikoError('update error(give auth)', 500, 500026);
        }

        return flag;
    }

    async createUser(
        @TransactionManager() manager: EntityManager,
        data: ISignup,
        USER_PROFILE_PK: number,
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
            user.USER_PROFILE_PK = USER_PROFILE_PK;
            user.TEL = data.tel;
            user.CREATE_DATE = Math.floor(new Date().getTime() / 1000);
            user.IS_DELETED = 0;
            user.IS_VERIFIED = 0;

            result = await manager.insert(User, user);
        } catch (err) {
            throw new AikoError('insert error(create user)', 500, 500122);
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
                .select()
                .leftJoinAndSelect('U.company', 'c')
                .leftJoinAndSelect('U.department', 'd')
                .where('U.COMPANY_PK = :COMPANY_PK', { COMPANY_PK: companyPK })
                .getMany();
        } catch (err) {
            throw new AikoError('select error(member list)', 500, 500044);
        }

        return userList;
    }

    async checkDuplicateNickname(nickname: string): Promise<number> {
        try {
            return await this.createQueryBuilder('U')
                .where('U.NICKNAME = :NICKNAME', { NICKNAME: nickname })
                .getCount();
        } catch (err) {
            throw new AikoError('count error(duplicate nickname)', 500, 500045);
        }
    }

    async searchMembers(str: string, COMPANY_PK: number) {
        let users: User[] = [];

        try {
            const query = `%${str.toLowerCase()}%`;
            users = await this.createQueryBuilder('u')
                .leftJoinAndSelect('u.department', 'department')
                .where('u.COMPANY_PK = :COMPANY_PK', { COMPANY_PK: COMPANY_PK })
                .andWhere(
                    new Brackets((qb) => {
                        qb.where('u.NICKNAME like :NICKNAME', { NICKNAME: query })
                            .orWhere('u.EMAIL like :EMAIL', { EMAIL: query })
                            .orWhere('u.FIRST_NAME like :FIRST_NAME', { FIRST_NAME: query })
                            .orWhere('u.LAST_NAME like :LAST_NAME', { LAST_NAME: query })
                            .orWhere('u.TEL like :TEL', { TEL: query });
                    }),
                )
                .getMany();
        } catch (err) {
            throw new AikoError('user/searchMembers', 500, 506040);
        }

        return users;
    }

    async addMemberToDepartment(COMPANY_PK: number, DEPARTMENT_PK: number, USER_PK: number) {
        let flag = false;

        try {
            const user = await this.getUserInfoWithUserPK(USER_PK);
            if (COMPANY_PK === user.COMPANY_PK) {
                await this.createQueryBuilder()
                    .update()
                    .set({ DEPARTMENT_PK })
                    .where('USER_PK = :USER_PK', { USER_PK })
                    .execute();
                flag = true;
            } else throw new Error();
        } catch (err) {
            console.log(err);
            if (err instanceof AikoError) throw err;
            else throw new AikoError('user/addMemberToDepartment', 500, 578431);
        }

        return flag;
    }

    async getUserInfoWithUserPKAndCompanyPK(USER_PK: number, COMPANY_PK: number) {
        try {
            return await this.createQueryBuilder('u')
                .where('u.USER_PK = :USER_PK', { USER_PK })
                .andWhere('u.COMPANY_PK = :COMPANY_PK', { COMPANY_PK })
                .getOneOrFail();
        } catch (err) {
            console.error(err);
            throw new AikoError('user/getUserInfoWithUserPKAndCompanyPK', 500, 100203);
        }
    }

    async getCompanyMemberList(COMPANY_PK: number) {
        try {
            const memberList = await this.createQueryBuilder('u')
                .leftJoinAndSelect('u.company', 'c')
                .leftJoinAndSelect('u.department', 'd')
                .where('u.COMPANY_PK = :COMPANY_PK', { COMPANY_PK })
                .getMany();

            return memberList.map((member) => propsRemover(member, ...criticalUserInfo));
        } catch (err) {
            console.error(err);
            throw new AikoError('user/getCompanyMemberList', 500, 1023894);
        }
    }
}
