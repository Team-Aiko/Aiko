import { Request, Response } from 'express';
import CompanyService from '../services/company.service';
import { resExecutor } from 'src/Helpers/functions';
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { UserGuard } from 'src/guard/user.guard';
import { AikoError } from 'src/Helpers/classes';

@Controller('company')
export default class CompanyController {
    readonly success = new AikoError('OK', 200, 200000);

    constructor(private companyService: CompanyService) {}
    // 회사 리스트 출력
    @Get('list')
    async list(@Req() req: Request, @Res() res: Response) {
        const { companyName } = req.query;
        const result = await this.companyService.list(companyName as string);
        resExecutor(res, this.success, result);
    }

    // 회사 내 부서 리스트 출력

    @UseGuards(UserGuard)
    @Get('/department-list')
    async departmentList(@Req() req: Request, @Res() res: Response) {
        const payload = req.body.payload;
        const result = await this.companyService.departmentList(payload);
        resExecutor(res, this.success, result);
    }

    @UseGuards(UserGuard)
    @Get('/employee-list')
    async getDepartmentMembers(@Req() req: Request, @Res() res: Response) {
        const { DEPARTMENT_PK, COMPANY_PK }: { DEPARTMENT_PK: number; COMPANY_PK: number } = req.body.userPayload;

        try {
            const data = await this.companyService.getDepartmentMembers(DEPARTMENT_PK, COMPANY_PK);
            resExecutor(res, this.success, data);
        } catch (err) {
            if (err instanceof AikoError) throw resExecutor(res, err);
        }
    }
}
