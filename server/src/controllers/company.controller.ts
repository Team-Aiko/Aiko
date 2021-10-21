import { Request, Response } from 'express';
import CompanyService from '../services/company.service';
import { getResPacket } from 'src/Helpers/functions';
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
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

    @UseGuards(UserGuard)
    @Get('/employee-list')
    getDepartmentMembers(@Req() req: Request, @Res() res: Response) {
        const { DEPARTMENT_PK, COMPANY_PK }: { DEPARTMENT_PK: number; COMPANY_PK: number } = req.body.userPayload;
        this.companyService
            .getDepartmentMembers(DEPARTMENT_PK, COMPANY_PK)
            .then((result) => {
                res.send(getResPacket('OK', 200, 200000, result));
            })
            .catch((err) => {
                console.error(err);
                res.send(getResPacket('error', 500, 500000));
            });
    }
}
