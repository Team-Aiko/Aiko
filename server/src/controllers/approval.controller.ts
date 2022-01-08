import { Body, Controller, Get, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserGuard } from 'src/guard/user.guard';
import { Request, Response } from 'express';
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
    createApproval(@Req() req: Request, @Body('userPayload') userPayload: IUserPayload, @Res() res: Response) {
        const { title, content, approverPks, agreerPks } = req.body;
        const departmentPk = userPayload.DEPARTMENT_PK;
        const comPk = userPayload.COMPANY_PK;
        const userPk = userPayload.USER_PK;
        this.approvalService.createApproval(title, content, approverPks, agreerPks, departmentPk, comPk, userPk);
    }
}
