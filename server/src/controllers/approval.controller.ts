import { Body, Controller, Get, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserGuard } from 'src/guard/user.guard';
import { Request, Response } from 'express';
import { AikoError, resExecutor, usrPayloadParser, Pagination } from 'src/Helpers';
import ApprovalService from 'src/services/approval.service';
import UserPayloadParserInterceptor from 'src/interceptors/userPayloadParser.interceptor';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';
import RequestLoggerInterceptor from 'src/interceptors/requestLogger.Interceptor';

@UseInterceptors(UserPayloadParserInterceptor, RequestLoggerInterceptor)
@UseGuards(UserGuard)
@Controller('approval')
export default class ApprovalController {
    constructor(private approvalService: ApprovalService) {}

    // ! api doc
    @Post('write')
    async createApproval(@Req() req: Request, @Res() res: Response) {
        try {
            const { title, content, approverPks, agreerPks, approvalInfo } = req.body;
            const userPayload = usrPayloadParser(req);
            const departmentPk = userPayload.DEPARTMENT_PK;
            const comPk = userPayload.COMPANY_PK;
            const userPk = userPayload.USER_PK;
            // approverPks.push(userPk);
            console.log(approvalInfo[1]);
            await this.approvalService.createApproval(title, content, approvalInfo, departmentPk, comPk, userPk);
            resExecutor(res, { result: true });
        } catch (err) {
            console.log(err);
            throw resExecutor(res, { err });
        }
    }

    @Get('list')
    async viewApproval(@Req() req: Request, @Res() res: Response) {
        try {
            const { currentPage, feedsPerPage, groupCnt } = req.query;
            const view = req.query.view.toString();
            const userPayload = usrPayloadParser(req);
            const departmentPk = userPayload.DEPARTMENT_PK;
            const comPk = userPayload.COMPANY_PK;
            const userPk = userPayload.USER_PK;
            const result = await this.approvalService.viewApproval(userPk, departmentPk, comPk, view);
            // const cnt = new Pagination(currentPage, )
            resExecutor(res, { result: result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }
}
