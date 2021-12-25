import { EntityRepository, Repository, getManager } from 'typeorm';
import { Department, User } from 'src/entity';
import { getRepo, propsRemover, stackAikoError } from 'src/Helpers/functions';
import { UserRepository } from '.';
import { INewDepartment } from 'src/interfaces/MVC/companyMVC';
import { AikoError } from 'src/Helpers/classes';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';

enum departmentError {
    createDepartment = 1,
    getDepartmentMembers = 2,
    deleteDepartment = 3,
    updateDepartmentName = 4,
    searchDepartment = 5,
    getDepartmentTree = 6,
    getDepartmentList = 7,
    bootstrapNode = 8,
}

type DeptUnion = Pick<INewDepartment, 'companyPK' | 'departmentName' | 'parentPK' | 'parentDepth'>;

@EntityRepository(Department)
export default class DepartmentRepository extends Repository<Department> {
    async createDepartment(bundle: DeptUnion) {
        let flag = false;

        try {
            await this.createQueryBuilder()
                .insert()
                .into(Department)
                .values({
                    COMPANY_PK: bundle.companyPK,
                    PARENT_PK: bundle.parentPK ? bundle.parentPK : null,
                    DEPARTMENT_NAME: bundle.departmentName,
                    DEPTH: bundle.parentPK ? bundle.parentDepth + 1 : 0,
                })
                .execute();

            flag = true;
        } catch (err) {
            throw stackAikoError(
                err,
                'insert error (new department row)',
                500,
                headErrorCode.departmentDB + departmentError.createDepartment,
            );
        }
        return flag;
    }

    async getDepartmentMembers(departmentPK: number, companyPK: number) {
        const userList: User[] = [];

        try {
            const sqlOne = `with recursive DEPARTMENT_TREE as (
            select
                *
            from DEPARTMENT_TABLE
            where DEPARTMENT_PK = ? AND COMPANY_PK = ?
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
                        .select([
                            'U.USER_PK',
                            'U.FIRST_NAME',
                            'U.LAST_NAME',
                            'U.EMAIL',
                            'U.TEL',
                            'U.DEPARTMENT_PK',
                            'U.NICKNAME',
                        ])
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
            throw stackAikoError(
                err,
                'department/getDepartmentMembers',
                500,
                headErrorCode.departmentDB + departmentError.getDepartmentMembers,
            );
        }

        return userList;
    }

    async deleteDepartment(departmentPK: number, COMPANY_PK: number) {
        let flag = false;

        try {
            const childrenCnt = await this.createQueryBuilder('d')
                .where('d.PARENT_PK = :DEPARTMENT_PK', {
                    DEPARTMENT_PK: departmentPK,
                })
                .getCount();

            if (childrenCnt) throw stackAikoError(undefined, 'department/deleteDepartment/isChildren', 500, 500452);

            const result2 = await this.createQueryBuilder('d')
                .leftJoinAndSelect('d.users', 'users')
                .where('d.DEPARTMENT_PK = :DEPARTMENT_PK', {
                    DEPARTMENT_PK: departmentPK,
                })
                .andWhere('d.COMPANY_PK = :COMPANY_PK', { COMPANY_PK })
                .getOne();

            if (result2?.users.length)
                throw stackAikoError(undefined, 'department/deleteDepartment/isMembers', 500, 500451);
            else if (result2 === undefined || result2 === null)
                throw stackAikoError(undefined, 'department/deleteDepartment/noDepartment', 500, 500678);
            else {
                this.createQueryBuilder()
                    .delete()
                    .where('DEPARTMENT_PK = :DEPARTMENT_PK', { DEPARTMENT_PK: departmentPK })
                    .execute();
                flag = true;
            }
        } catch (err) {
            console.error(err);
            throw stackAikoError(
                err,
                'departmentRepository/deleteDepartment',
                500,
                headErrorCode.departmentDB + departmentError.deleteDepartment,
            );
        }

        return flag;
    }

    async updateDepartmentName(departmentPK: number, departmentName: string, companyPK: number) {
        console.log(
            '🚀 ~ file: department.repository.ts ~ line 119 ~ DepartmentRepository ~ updateDepartmentName ~ companyPK',
            companyPK,
        );
        let flag = false;

        try {
            const result = await this.createQueryBuilder()
                .update(Department)
                .set({
                    DEPARTMENT_NAME: departmentName,
                })
                .where('DEPARTMENT_PK = :DEPARTMENT_PK', { DEPARTMENT_PK: departmentPK })
                .andWhere('COMPANY_PK = :COMPANY_PK', { COMPANY_PK: companyPK })
                .execute();

            flag = true;
        } catch (err) {
            console.error(err);
            throw stackAikoError(
                err,
                'department/updateDepartmentName',
                500,
                headErrorCode.departmentDB + departmentError.updateDepartmentName,
            );
        }

        return flag;
    }

    async searchDepartment(str: string, COMPANY_PK: number) {
        let depts: Department[] = [];

        try {
            const query = `%${str}%`;
            depts = await this.createQueryBuilder('d')
                .leftJoinAndSelect('d.users', 'users')
                .where('d.COMPANY_PK = :COMPANY_PK', { COMPANY_PK })
                .andWhere('d.DEPARTMENT_NAME like :DEPARTMENT_NAME', { DEPARTMENT_NAME: query })
                .getMany();
        } catch (err) {
            throw stackAikoError(
                err,
                'department/searchDepartment',
                500,
                headErrorCode.departmentDB + departmentError.searchDepartment,
            );
        }

        return depts;
    }

    async getDepartmentTree(COMPANY_PK: number, DEPARTMENT_PK: number) {
        let departmentTree: Department[] = [];

        try {
            let DEPTH = 0;

            if (DEPARTMENT_PK !== -1) {
                const result = await this.createQueryBuilder('d')
                    .where('d.DEPARTMENT_PK = :DEPARTMENT_PK', {
                        DEPARTMENT_PK,
                    })
                    .getOneOrFail();
                DEPTH = result.DEPTH;
            }

            const fracture = this.createQueryBuilder('d')
                .leftJoinAndSelect('d.children', 'children')
                .where('d.COMPANY_PK = :COMPANY_PK', { COMPANY_PK })
                .andWhere('d.DEPTH = :DEPTH', { DEPTH });

            if (DEPARTMENT_PK === -1) {
                const initial = await fracture.getMany();

                const flagList = await this.bootstrapNode(initial, COMPANY_PK, DEPTH + 1);
                const flag = flagList.reduce((prev, curr) => prev && curr, true);

                if (!flag) throw stackAikoError(undefined, 'department/getDepartmentTree', 500, 500821);
                departmentTree = departmentTree.concat(initial);
            } else {
                const initial = await fracture
                    .andWhere('d.DEPARTMENT_PK = :DEPARTMENT_PK', { DEPARTMENT_PK })
                    .getOneOrFail();

                const flagList = await this.bootstrapNode([initial], COMPANY_PK, DEPTH + 1);
                const flag = flagList.reduce((prev, curr) => prev && curr, true);

                if (!flag) throw stackAikoError(undefined, 'department/getDepartmentTree', 500, 500821);
                departmentTree = departmentTree.concat(initial);
            }
        } catch (err) {
            if (err instanceof AikoError) throw err;
            else {
                throw stackAikoError(
                    err,
                    'departmentRepository/getDepartmentTree',
                    500,
                    headErrorCode.departmentDB + departmentError.getDepartmentTree,
                );
            }
        }

        return departmentTree;
    }

    async getDepartmentList(COMPANY_PK: number) {
        try {
            return await this.createQueryBuilder('d').where('d.COMPANY_PK = :COMPANY_PK', { COMPANY_PK }).getMany();
        } catch (err) {
            console.error(err);
            throw stackAikoError(
                err,
                'department/getDepartmentList',
                500,
                headErrorCode.departmentDB + departmentError.getDepartmentList,
            );
        }
    }

    // * util functions
    async bootstrapNode(departments: Department[], COMPANY_PK: number, depth: number) {
        const DEPTH = depth;

        return await Promise.all(
            departments.map(async (dept) => {
                try {
                    const PARENT_PK = dept.DEPARTMENT_PK;
                    dept.children = await this.createQueryBuilder('d')
                        .leftJoinAndSelect('d.children', 'children')
                        .where('d.COMPANY_PK = :COMPANY_PK', { COMPANY_PK })
                        .andWhere('d.DEPTH = :DEPTH', { DEPTH })
                        .andWhere('d.PARENT_PK = :PARENT_PK', { PARENT_PK })
                        .getMany();
                    await this.bootstrapNode(dept.children, COMPANY_PK, DEPTH + 1);
                    return true;
                } catch (err) {
                    throw stackAikoError(
                        err,
                        'department/bootstrapNode',
                        500,
                        headErrorCode.departmentDB + departmentError.bootstrapNode,
                    );
                }
            }),
        );
    }
}
