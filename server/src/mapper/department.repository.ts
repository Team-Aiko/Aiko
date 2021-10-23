import {
    EntityRepository,
    getConnection,
    InsertResult,
    Repository,
    getManager,
    TransactionManager,
    EntityManager,
    Transaction,
} from 'typeorm';
import { Department, User } from 'src/entity';
import { getRepo, propsRemover } from 'src/Helpers/functions';
import { UserRepository } from '.';

@EntityRepository(Department)
export default class DepartmentRepository extends Repository<Department> {
    async createOwnerRow(@TransactionManager() manager: EntityManager, companyPK: number): Promise<InsertResult> {
        let insertResult: InsertResult;

        try {
            const dept = new Department();
            dept.DEPARTMENT_NAME = 'OWNER';
            dept.COMPANY_PK = companyPK;
            dept.DEPTH = 0;

            insertResult = await this.manager.insert(Department, dept);
        } catch (err) {
            console.log(err);
        }

        return insertResult;
    }

    async getDepartmentMembers(departmentPK: number, companyPK: number) {
        const userList: User[] = [];

        try {
            const sqlOne = `with recursive DEPARTMENT_TREE as (
            select
                *
            from DEPARTMENT_TABLE
            where DEPARTMENT_PK = $1 AND COMPANY_PK = $2
            union all
            select
                D1.*
            from
                DEPARTMENT_TABLE AS D1, DEPARTMENT_TREE AS D2
            where
                D1.PARENT_PK = D2.DEPARTMENT_PK
            ) select * from DEPARTMENT_TREE`;

            const entityManager = getManager();
            const result1 = (await entityManager.query(sqlOne, [departmentPK, companyPK])) as Department[];
            const result2 = await Promise.all(
                result1.map(async (dept) => {
                    return await getRepo(UserRepository)
                        .createQueryBuilder('U')
                        .select(['U.USER_PK', 'U.FIRST_NAME', 'U.LAST_NAME', 'U.EMAIL', 'U.TEL', 'U.DEPARTMENT_PK'])
                        .leftJoinAndSelect('U.department', 'D')
                        .where('U.DEPARTMENT_PK = D.DEPARTMENT_PK')
                        .andWhere('D.DEPARTMENT_PK = :departmentPK', { departmentPK: dept.DEPARTMENT_PK })
                        .getMany();
                }),
            );

            result2.forEach((arr) => {
                arr.forEach((user) => {
                    userList.push(propsRemover(user, 'PASSWORD', 'SALT', 'IS_VERIFIED', 'IS_DELETED'));
                });
            });

            result2.forEach((arr) => userList.concat(arr));
        } catch (err) {
            console.error(err);
            throw err;
        }

        return userList;
    }
}
