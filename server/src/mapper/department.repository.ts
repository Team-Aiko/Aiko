import { EntityRepository, getConnection, InsertResult, Repository } from 'typeorm';
import { Department } from 'src/entity';

@EntityRepository(Department)
export default class DepartmentRepository extends Repository<Department> {
    async createOwnerRow(companyPK: number): Promise<InsertResult> {
        let insertResult: InsertResult;

        try {
            this.createQueryBuilder()
                .insert()
                .into(Department)
                .values({ DEPARTMENT_NAME: 'OWNER', COMPANY_PK: companyPK, DEPTH: 0 })
                .execute();
        } catch (err) {
            console.log(err);
        }

        return insertResult;
    }
    // departmentList(companyPk: number) {
    //     return this.createQueryBuilder('d')
    //         .select(['d.DEPARTMENT_PK', 'd.DEPARTMENT_NAME', 'd.DEPARTMENT_NAME', 'd.PARENT_PK', 'd.DEPTH'])
    //         .where('COMPANY_PK like :companyPk', { companyPk: `${companyPk}` })
    //         .where('')
    //         .getMany();
    // }
    // departmentChildren(departmentPk: number) {
    //     return this.createQueryBuilder('d')
    //         .select(['d.DEPARTMENT_PK', 'd.DEPARTMENT_NAME', 'd.DEPARTMENT_NAME', 'd.PARENT_PK', 'd.DEPTH'])
    //         .where('PARENT_PK like :departmentPk', { departmentPk: `${departmentPk}` })
    //         .getMany();
    // }
}
