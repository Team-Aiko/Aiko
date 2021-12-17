import { Controller, Get, Post, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserGuard } from 'src/guard/user.guard';
import { Request, Response } from 'express';
import { AikoError, resExecutor, usrPayloadParser, Pagination } from 'src/Helpers';
import ApprovalService from 'src/services/approval.service';

@UseGuards(UserGuard)
@Controller('approval')
export default class ApprovalController {
    constructor(private approvalService: ApprovalService) {}

    @Post('write')
    async createApproval(@Req() req: Request, @Res() res: Response) {
        try {
            const { title, content, approverPks, agreerPks } = req.body;
            const userPayload = usrPayloadParser(req);
            const departmentPk = userPayload.DEPARTMENT_PK;
            const comPk = userPayload.COMPANY_PK;
            const userPk = userPayload.USER_PK;
            await this.approvalService.createApproval(
                title,
                content,
                approverPks,
                agreerPks,
                departmentPk,
                comPk,
                userPk,
            );
            resExecutor(res, { result: true });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    @Get('list')
    async viewApproval(@Req() req: Request, @Res() res: Response) {
        try {
            const { currentPage, feedsPerPage, groupCnt } = req.query;
            const userPayload = usrPayloadParser(req);
            const departmentPk = userPayload.DEPARTMENT_PK;
            const comPk = userPayload.COMPANY_PK;
            const userPk = userPayload.USER_PK;
            await this.approvalService.createApproval(
                departmentPk,
                comPk,
                userPk,
            );
            const cnt = new Pagination(currentPage, )
            resExecutor(res, { result: true });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }
}
