import { Controller, Get, Req, Res } from '@nestjs/common';
import CompanyService from '../services/company.service';

@Controller('company')
export default class CompanyController {
    constructor(private companyService: CompanyService) {}
    // 회사 리스트 출력
    @Get('/list')
    async list(@Req() req, @Res() res) {
        const { companyName } = req.query;
        const result = await this.companyService.list(companyName);
        res.send(result);
    }
    // 회사 내 조직도 리스트 출력
    @Get('/organization-chart')
    async organizationChart(@Req() req, @Res() res) {
        const { companyName } = req.query;
        const result = await this.companyService.organizationChart(companyName);
        res.send(result);
    }
    // 해당 조직내 속한 사원 리스트 출력
    //getOranizationTree에 쓰일 재귀함수
}
