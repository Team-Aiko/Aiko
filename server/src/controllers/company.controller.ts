import { Controller, Get, Req, Res } from '@nestjs/common';
import CompanyService from '../services/company.service';

@Controller('company')
export default class CompanyController {
    constructor(private companyService: CompanyService) {}
    @Get('/list')
    list(@Req() req, @Res() res): void {
        const { companyName } = req.query;
        this.companyService.list(companyName, res);
    }
}
