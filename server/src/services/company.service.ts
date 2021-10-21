import { Res } from '@nestjs/common';
import CompanyRepository from 'src/mapper/company.repository';
import { getConnection } from 'typeorm';
import { getRepo } from 'src/Helpers/functions';
export default class CompanyService {
    // 회사 리스트 출력
    list(companyName: string) {
        const company = getRepo(CompanyRepository);
        const result = company.list(companyName);
        return result;
    }
    // 회사 조직도 출력
    organizationChart(req) {
        const company = getRepo(CompanyRepository);
        const result = company.organizationChart(companyName);
        return result;
    }
}
