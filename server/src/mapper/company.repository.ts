import { EntityRepository, Repository } from 'typeorm';
import Company from '../entity/company.entity';

@EntityRepository(Company)
export default class CompanyRepository extends Repository<Company> {
    // 회사 리스트 출력
    list(companyName: string) {
        return this.createQueryBuilder()
            .where('COMPANY_NAME like :companyName', { companyName: `${companyName}` })
            .getOne();
    }
    //회사 조직도 출력
    organizationChart(companyName: string) {
        const name = this.createQueryBuilder()
            .where('COMPANY_NAME like :companyName', { companyName: `${companyName}` })
            .getOne();
        return name;
    }

    //!-complted
}
