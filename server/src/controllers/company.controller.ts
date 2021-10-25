import { Request, Response } from 'express';
import CompanyService from '../services/company.service';
import { resExecutor } from 'src/Helpers/functions';
import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserGuard } from 'src/guard/user.guard';
import { AikoError } from 'src/Helpers/classes';
import { User } from 'src/entity';
import { INewDepartment, IPermissionBundle } from 'src/interfaces/MVC/companyMVC';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';

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

    /**
     * 작성자: Aivyss
     * 해당부서와 하속부서의 직원정보를 조회하는 api
     */
    @UseGuards(UserGuard)
    @Get('employee-list')
    async getDepartmentMembers(@Req() req: Request, @Res() res: Response) {
        const { DEPARTMENT_PK, COMPANY_PK } = req.body.userPayload as IUserPayload;

        try {
            const data = await this.companyService.getDepartmentMembers(DEPARTMENT_PK, COMPANY_PK);
            resExecutor(res, this.success, data);
        } catch (err) {
            if (err instanceof AikoError) throw resExecutor(res, err);
        }
    }
    /**
     * 작성자: Aivyss
     * body에 담기는 내용: departmentName, parentPK, parentDepth
     */
    @UseGuards(UserGuard)
    @Post('new-department')
    async createDepartment(@Req() req: Request, @Res() res: Response) {
        try {
            const { departmentName, parentPK, parentDepth, userPayload } = req.body;
            const { COMPANY_PK, USER_PK } = userPayload as IUserPayload;
            const bundle: INewDepartment = {
                companyPK: COMPANY_PK,
                userPK: USER_PK,
                departmentName,
                parentPK,
                parentDepth,
            };

            const isSuccess = await this.companyService.createDepartment(bundle);
            if (isSuccess) resExecutor(res, this.success, isSuccess);
            else throw new AikoError('unknown error', 500, 500123);
        } catch (err) {
            throw resExecutor(res, err);
        }
    }

    /**
     * 작성자: Aivyss
     * 유저에게 특정 권한을 부여하는 api
     * 현재는 authListPK === 1 인 경우만 존재
     */
    @UseGuards(UserGuard)
    @Post('permission')
    async givePermission(@Req() req: Request, @Res() res: Response) {
        const { userPayload, authListPK, targetUserPK, companyPK } = req.body;
        const { USER_PK, grants } = userPayload as IUserPayload;
        const bundle: IPermissionBundle = {
            authListPK,
            targetUserPK,
            grants,
            USER_PK,
            companyPK,
        };
        try {
            const isSuccess = await this.companyService.givePermission(bundle);
            if (isSuccess) resExecutor(res, this.success, isSuccess);
            else throw new AikoError('unknown error', 500, 500123);
        } catch (err) {
            if (err instanceof AikoError) throw resExecutor(res, err);
        }
    }

    /**
     * 작성자 : Aivyss
     * 지정한 부서를 지우는 api
     */
    @UseGuards(UserGuard)
    @Post('delete-department')
    async deleteDepartment(@Req() req: Request, @Res() res: Response) {
        const { userPayload, departmentPK } = req.body;
        const { grants, COMPANY_PK } = userPayload as IUserPayload;

        try {
            const flag = await this.companyService.deleteDepartment(departmentPK, COMPANY_PK, grants);
            if (flag) resExecutor(res, this.success, flag);
            else throw new AikoError('unknown error', 500, 500123);
        } catch (err) {
            if (err instanceof AikoError) throw resExecutor(res, err);
            console.error(err);
        }
    }

    /**
     * 작성자: Aivyss
     * 지정한 부서의 이름을 바꾸는 api
     */
    @UseGuards(UserGuard)
    @Post('change-department-name')
    async updateDepartmentName(@Req() req: Request, @Res() res: Response) {
        const { userPayload, departmentPK, departmentName } = req.body;
        const { grants, COMPANY_PK } = userPayload as IUserPayload;

        try {
            const flag = await this.companyService.updateDepartmentName(
                departmentPK,
                departmentName,
                COMPANY_PK,
                grants,
            );
            if (flag) resExecutor(res, this.success, flag);
            else throw new AikoError('unknown error', 500, 500123);
        } catch (err) {
            if (err instanceof AikoError) throw resExecutor(res, err);
        }
    }

    /**
     * 작성자: Aivyss
     * 사원 통합검색 api  (닉네임, 성, 이름, 이메일, 전화번호, 부서명 와일드카드 검색)
     */
    @UseGuards(UserGuard)
    @Get('searching-members')
    async searchMembers(@Req() req: Request, @Res() res: Response) {
        const { userPayload } = req.body;
        const { str } = req.query;
        const { grants, COMPANY_PK } = userPayload as IUserPayload;

        try {
            const users = await this.companyService.searchMembers(str as string, COMPANY_PK, grants);
            resExecutor(res, this.success, users);
        } catch (err) {
            if (err instanceof AikoError) throw resExecutor(res, err);
        }
    }

    /**
     * 작성자: Aivyss
     * 부서의 풀트리를 만드는 api
     */
    @UseGuards(UserGuard)
    @Get('department-tree')
    async getDepartmentTree(@Req() req: Request, @Res() res: Response) {
        const { COMPANY_PK } = req.body.userPayload as IUserPayload;
        const { departmentPK } = req.query;

        try {
            let DEPARTMENT_PK = Number(departmentPK);

            if (!DEPARTMENT_PK) DEPARTMENT_PK = -1;
            const departmentTree = await this.companyService.getDepartmentTree(COMPANY_PK, DEPARTMENT_PK);
            resExecutor(res, this.success, departmentTree);
        } catch (err) {
            if (err instanceof AikoError) throw resExecutor(res, err);
        }
    }
}
