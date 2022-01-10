import { Request, Response } from 'express';
import CompanyService from '../services/company.service';
import { Body, Controller, Get, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserGuard } from 'src/guard/user.guard';
import { resExecutor, isChiefAdmin } from 'src/Helpers';
import { INewDepartment, IPermissionBundle } from 'src/interfaces/MVC/companyMVC';
import { bodyChecker } from 'src/Helpers/functions';
import UserPayloadParserInterceptor from 'src/interceptors/userPayloadParser.interceptor';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';
import RequestLoggerInterceptor from 'src/interceptors/requestLogger.Interceptor';

@Controller('company')
@UseInterceptors(RequestLoggerInterceptor)
export default class CompanyController {
    constructor(private companyService: CompanyService) {}

    // ! api doc
    // 회사 리스트 출력
    @Get('list')
    async list(@Req() req: Request, @Res() res: Response) {
        const { companyName } = req.query;
        const result = await this.companyService.list(companyName as string);
        resExecutor(res, { result });
    }

    // ! api doc
    /**
     * 작성자: Aivyss
     * 해당부서와 하속부서의 직원정보를 조회하는 api
     */
    @UseGuards(UserGuard)
    @UseInterceptors(UserPayloadParserInterceptor)
    @Get('employee-list')
    async getDepartmentMembers(
        @Req() req: Request,
        @Body('userPayload') userPayload: IUserPayload,
        @Res() res: Response,
    ) {
        const { COMPANY_PK } = userPayload;
        const { deptId } = req.query;

        try {
            const result = await this.companyService.getDepartmentMembers(Number(deptId), COMPANY_PK);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    /**
     * 작성자: Aivyss
     * body에 담기는 내용: departmentName, parentPK, parentDepth
     */
    @UseGuards(UserGuard)
    @UseInterceptors(UserPayloadParserInterceptor)
    @Post('new-department')
    async createDepartment(@Req() req: Request, @Body('userPayload') userPayload: IUserPayload, @Res() res: Response) {
        try {
            const { departmentName, parentPK, parentDepth } = req.body;
            const { COMPANY_PK, USER_PK } = userPayload;
            bodyChecker({ departmentName, parentDepth }, { departmentName: ['string'], parentDepth: ['number'] });

            const bundle: INewDepartment = {
                companyPK: COMPANY_PK,
                userPK: USER_PK,
                departmentName,
                parentPK,
                parentDepth,
            };

            const isSuccess = await this.companyService.createDepartment(bundle);
            if (isSuccess) resExecutor(res, { result: isSuccess });
            else throw new Error();
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    /**
     * 작성자: Aivyss
     * 유저에게 특정 권한을 부여하는 api
     * 현재는 authListPK === 1 인 경우만 존재
     */
    @UseGuards(UserGuard)
    @UseInterceptors(UserPayloadParserInterceptor)
    @Post('permission')
    async givePermission(@Req() req: Request, @Body('userPayload') userPayload: IUserPayload, @Res() res: Response) {
        try {
            const { authListPK, targetUserPK } = req.body;
            const { USER_PK, COMPANY_PK, grants } = userPayload;
            bodyChecker({ authListPK, targetUserPK }, { authListPK: ['number'], targetUserPK: ['number'] });

            const bundle: IPermissionBundle = {
                authListPK,
                targetUserPK,
                grants,
                USER_PK,
                companyPK: COMPANY_PK,
            };
            const isSuccess = await this.companyService.givePermission(bundle);
            if (isSuccess) resExecutor(res, { result: isSuccess });
            else throw Error();
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    /**
     * 작성자 : Aivyss
     * 지정한 부서를 지우는 api
     */
    @UseGuards(UserGuard)
    @UseInterceptors(UserPayloadParserInterceptor)
    @Post('delete-department')
    async deleteDepartment(@Req() req: Request, @Body('userPayload') userPayload: IUserPayload, @Res() res: Response) {
        try {
            const { departmentPK } = req.body;
            const { grants, COMPANY_PK } = userPayload;
            bodyChecker({ departmentPK }, { departmentPK: ['number'] });

            const result = await this.companyService.deleteDepartment(departmentPK, COMPANY_PK, grants);
            if (result) resExecutor(res, { result });
            else throw Error();
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    /**
     * 작성자: Aivyss
     * 지정한 부서의 이름을 바꾸는 api
     */
    @UseGuards(UserGuard)
    @UseInterceptors(UserPayloadParserInterceptor)
    @Post('change-department-name')
    async updateDepartmentName(
        @Req() req: Request,
        @Body('userPayload') userPayload: IUserPayload,
        @Res() res: Response,
    ) {
        try {
            const { departmentPK, departmentName } = req.body;
            const { grants, COMPANY_PK } = userPayload;
            bodyChecker({ departmentPK, departmentName }, { departmentPK: ['number'], departmentName: ['string'] });

            const result = await this.companyService.updateDepartmentName(
                departmentPK,
                departmentName,
                COMPANY_PK,
                grants,
            );
            if (result) resExecutor(res, { result });
            else throw new Error();
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    /**
     * 작성자: Aivyss
     * 사원 통합검색 api  (닉네임, 성, 이름, 이메일, 전화번호, 부서명 와일드카드 검색)
     */
    @UseGuards(UserGuard)
    @UseInterceptors(UserPayloadParserInterceptor)
    @Get('searching-members')
    async searchMembers(@Req() req: Request, @Body('userPayload') userPayload: IUserPayload, @Res() res: Response) {
        const { str } = req.query;
        const { grants, COMPANY_PK } = userPayload;

        try {
            const result = await this.companyService.searchMembers(str as string, COMPANY_PK, grants);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    /**
     * 작성자: Aivyss
     * 부서의 풀트리를 만드는 api
     */
    @UseGuards(UserGuard)
    @UseInterceptors(UserPayloadParserInterceptor)
    @Get('department-tree')
    async getDepartmentTree(@Req() req: Request, @Body('userPayload') userPayload: IUserPayload, @Res() res: Response) {
        const { COMPANY_PK } = userPayload;
        const { departmentPK } = req.query;

        try {
            let DEPARTMENT_PK = Number(departmentPK);

            if (!DEPARTMENT_PK) DEPARTMENT_PK = -1;
            const result = await this.companyService.getDepartmentTree(COMPANY_PK, DEPARTMENT_PK);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    /**
     * 작성자: Aivyss
     * 유저에게 부서를 부여하는 api
     * @param req
     * @param res
     */
    @UseGuards(UserGuard)
    @UseInterceptors(UserPayloadParserInterceptor)
    @Post('add-mem-to-dept')
    async addMemberToDepartment(
        @Req() req: Request,
        @Body('userPayload') userPayload: IUserPayload,
        @Res() res: Response,
    ) {
        try {
            const { departmentPK, userPK } = req.body;
            const { grants, COMPANY_PK } = userPayload;
            bodyChecker({ departmentPK, userPK }, { departmentPK: ['number'], userPK: ['number'] });

            const result = await this.companyService.addMemberToDepartment(COMPANY_PK, departmentPK, userPK, grants);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    @UseGuards(UserGuard)
    @UseInterceptors(UserPayloadParserInterceptor)
    @Get('check-admin')
    async checkAdmin(@Req() req: Request, @Body('userPayload') userPayload: IUserPayload, @Res() res: Response) {
        try {
            const { grants } = userPayload;
            const result = isChiefAdmin(grants);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    @UseGuards(UserGuard)
    @UseInterceptors(UserPayloadParserInterceptor)
    @Get('member-list')
    async getCompanyMemberList(
        @Req() req: Request,
        @Body('userPayload') userPayload: IUserPayload,
        @Res() res: Response,
    ) {
        try {
            const { COMPANY_PK } = userPayload;
            const result = await this.companyService.getCompanyMemberList(COMPANY_PK);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }
}
