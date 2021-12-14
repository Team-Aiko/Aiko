import { Controller, Get, Post, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserGuard } from 'src/guard/user.guard';
import { Request, Response } from 'express';
import { AikoError, resExecutor, usrPayloadParser } from 'src/Helpers';
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
}
