import CompanyRepository from 'src/mapper/company.repository';
import { getRepo } from 'src/Helpers/functions';

export default class CompanyService {
    // 회사 리스트 출력
    async list(companyName: string) {
        return await getRepo(CompanyRepository).list(companyName);
    }
    // 회사 조직도 출력
    async organizationChart(payload) {
        return await getRepo(CompanyRepository).organizationChart(payload);
    }
}
