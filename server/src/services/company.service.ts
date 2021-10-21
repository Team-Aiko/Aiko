import { Res } from '@nestjs/common';
import CompanyRepository from 'src/mapper/company.repository';
import { getConnection } from 'typeorm';
import { getRepo } from 'src/Helpers/functions';
import { DepartmentRepository } from 'src/mapper';

export default class CompanyService {
    // company entity

    async list(companyName: string, @Res() res) {
        const connection = getConnection();
        const company = connection.getCustomRepository(CompanyRepository);
        const result = await company.list(companyName);
        res.send(result);
    }

    async getDepartmentMembers(departmentPK: number, companyPK: number) {
        return await getRepo(DepartmentRepository).getDepartmentMembers(departmentPK, companyPK);
    }
}
