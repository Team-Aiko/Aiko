import { EntityRepository, Repository } from 'typeorm';
import Company from '../entity/company.entity';

@EntityRepository(Company)
export default class CompanyRepository extends Repository<Company> {
    //!-complted
    list(companyName: string) {
        return this.createQueryBuilder('c')
            .where('c.COMPANY_NAME like :companyName', { companyName: `${companyName}` })
            .getMany();
    }

    //!-complted
}
