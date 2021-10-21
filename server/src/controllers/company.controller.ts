import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import CompanyService from '../services/company.service';
import { getResPacket } from 'src/Helpers/functions';

@Controller('company')
export default class CompanyController {
    constructor(private companyService: CompanyService) {}

    @Get('/list')
    list(@Req() req, @Res() res): void {
        const { companyName } = req.query;
        this.companyService.list(companyName, res);
    }

    @Get('/member-list')
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
