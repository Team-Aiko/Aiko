import { Controller, Get, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserGuard } from 'src/guard/user.guard';
import { AikoError, resExecutor } from 'src/Helpers';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';
import WorkService from 'src/services/work.service';
import { success } from 'src/Helpers';
import { IActionCreateBundle } from 'src/interfaces/MVC/workMVC';

@Controller('work')
export default class WorkController {
    constructor(private workService: WorkService) {}

    /**
     * 작성자: Aivyss
     * action item 생성 api
     */
    @UseGuards(UserGuard)
    @Post('create-action-item')
    async createActionItem(@Req() req: Request, @Res() res: Response) {
        const { OWNER_PK, TITLE, DESCRIPTION, DUE_DATE, START_DATE, P_PK, STEP_PK, userPayload } = req.body;
        const { USER_PK, DEPARTMENT_PK, COMPANY_PK, grants } = userPayload as IUserPayload;
        const bundle: IActionCreateBundle = {
            P_PK,
            STEP_PK,
            DEPARTMENT_PK,
            COMPANY_PK,
            USER_PK: OWNER_PK,
            ASSIGNER_PK: USER_PK,
            DUE_DATE,
            START_DATE,
            TITLE,
            DESCRIPTION,
            grants,
        };

        try {
            const insertedId = await this.workService.createActionItem(bundle);
            resExecutor(res, success, insertedId);
        } catch (err) {
            if (err instanceof AikoError) throw resExecutor(res, err);
        }
    }

    @UseGuards(UserGuard)
    @Post('delete-action-item')
    async deleteActionItem(@Req() req: Request, @Res() res: Response) {
        const { ACTION_PK, userPayload } = req.body;
        const { grants, DEPARTMENT_PK } = userPayload as IUserPayload;

        try {
            const flag = await this.workService.deleteActionItem(ACTION_PK, DEPARTMENT_PK, grants);
            if (flag) resExecutor(res, success, flag);
            else throw new AikoError('unknown error', 500, 500328);
        } catch (err) {
            if (err instanceof AikoError) throw resExecutor(res, err);
        }
    }
}
