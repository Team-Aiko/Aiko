import { EntityRepository, InsertResult, Repository } from 'typeorm';
import Company from '../entity/company.entity';

@EntityRepository(Company)
export default class CompanyRepository extends Repository<Company> {
    // 회사 리스트 출력
    list(companyName: string) {
        return this.createQueryBuilder('c')
            .where('c.COMPANY_NAME like :COMPANY_NAME', { COMPANY_NAME: `${companyName}%` })
            .getOne();
    }

    //!-complted

    async createCompany(companyName: string): Promise<InsertResult> {
        let insertResult: InsertResult;

        try {
            insertResult = await this.createQueryBuilder()
                .insert()
                .into(Company)
                .values({
                    COMPANY_NAME: companyName,
                    CREATE_DATE: Math.floor(new Date().getTime() / 1000),
                })
                .execute();
        } catch (err) {
            console.error(err);
        }

        return insertResult;
    }
}
