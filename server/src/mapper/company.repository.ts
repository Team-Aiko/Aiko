import { User } from 'src/entity';
import { EntityManager, EntityRepository, InsertResult, Repository, Transaction, TransactionManager } from 'typeorm';
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
    async createCompany(@TransactionManager() manager: EntityManager, companyName: string): Promise<InsertResult> {
        console.log(
            '🚀 ~ file: company.repository.ts ~ line 17 ~ CompanyRepository ~ createCompany ~ companyName',
            companyName,
        );
        let insertResult: InsertResult;

        try {
            insertResult = await manager.insert(Company, {
                COMPANY_PK: null,
                COMPANY_NAME: companyName,
                CREATE_DATE: Math.floor(new Date().getTime() / 1000),
            });
            // .insert(Company)
            // .into()
            // .values({
            //     COMPANY_NAME: companyName,
            //     CREATE_DATE: Math.floor(new Date().getTime() / 1000),
            // })
            // .execute();
        } catch (err) {
            console.error(err);
        }

        return insertResult;
    }
}
