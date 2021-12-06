import { Controller, Get, Post, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserGuard } from 'src/guard/user.guard';
import { Request, Response } from 'express';
import { AikoError, resExecutor, usrPayloadParser } from 'src/Helpers';

@UseGuards(UserGuard)
@Controller('approval')
export default class ApprovalController {
    @Post('write')
    createApproval(@Req() req: Request, @Res() res: Response) {
        const { title, content, approver, agreer } = req.body;
        const userPayload = usrPayloadParser(req);
        const departmentPk = userPayload.DEPARTMENT_PK;
        const comPk = userPayload.COMPANY_PK;
        const userPk = userPayload.USER_PK;
    }
}
