import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import CompanyService from '../services/company.service';
import { getResPacket } from 'src/Helpers/functions';
import { UserGuard } from 'src/guard/user.guard';
@Controller('company')
export default class CompanyController {
    constructor(private companyService: CompanyService) {}
    // 회사 리스트 출력
    @Get('/list')
    async list(@Req() req, @Res() res) {
        const { companyName } = req.query;
        const result = await this.companyService.list(companyName);
        res.send(getResPacket('OK', 200, 200000, result));
    }

    // 회사 내 부서 리스트 출력

    @UseGuards(UserGuard)
    @Get('/department-list')
    async departmentList(@Req() req, @Res() res) {
        const payload = req.body.payload;
        const result = await this.companyService.departmentList(payload);
        res.send(getResPacket('OK', 200, 200000, result));
    }

    // 해당 부서 내 사원 리스트 출력

    @UseGuards(UserGuard)
    @Get('/employee-list')
    async employeeList(@Req() req, @Res() res) {
        const payload = req.body.payload;
        const result = await this.companyService.employeeList(payload);
        res.send(getResPacket('OK', 200, 200000, result));
    }

    //getOranizationTree에 쓰일 재귀함수
}
