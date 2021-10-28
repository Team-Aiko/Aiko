import { Controller, Get, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserGuard } from 'src/guard/user.guard';
import { AikoError, resExecutor, usrPayloadParser } from 'src/Helpers';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';
import WorkService from 'src/services/work.service';
import { success } from 'src/Helpers';
import { IItemBundle } from 'src/interfaces/MVC/workMVC';

@UseGuards(UserGuard)
@Controller('work')
export default class WorkController {
    constructor(private workService: WorkService) {}

    /**
     * 작성자: Aivyss
     * action item 생성 api
     */
    @Post('create-action-item')
    async createActionItem(@Req() req: Request, @Res() res: Response) {
        const userPayload = usrPayloadParser(req);
        const { OWNER_PK, TITLE, DESCRIPTION, DUE_DATE, START_DATE, P_PK, STEP_PK } = req.body;
        const { USER_PK, DEPARTMENT_PK, COMPANY_PK, grants } = userPayload;
        const bundle: IItemBundle = {
            P_PK,
            STEP_PK,
            DEPARTMENT_PK,
            USER_PK: OWNER_PK,
            ASSIGNER_PK: USER_PK,
            DUE_DATE,
            START_DATE,
            COMPANY_PK,
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
        const userPayload = usrPayloadParser(req);
        const { ACTION_PK } = req.body;
        const { grants, DEPARTMENT_PK } = userPayload;

        try {
            const flag = await this.workService.deleteActionItem(ACTION_PK, DEPARTMENT_PK, grants);
            if (flag) resExecutor(res, success, flag);
            else throw new AikoError('unknown error', 500, 500328);
        } catch (err) {
            if (err instanceof AikoError) throw resExecutor(res, err);
        }
    }

    @UseGuards(UserGuard)
    @Post('update-action-item')
    async updateActionItem(@Req() req: Request, @Res() res: Response) {
        const { ACTION_PK, OWNER_PK, TITLE, DESCRIPTION, START_DATE, DUE_DATE, P_PK, STEP_PK, updateCols } = req.body;
        const userPayload = usrPayloadParser(req);
        const { USER_PK, grants, DEPARTMENT_PK, COMPANY_PK } = userPayload;
        const ASSIGNER_PK = USER_PK;
        const bundle: IItemBundle = {
            ACTION_PK,
            USER_PK: OWNER_PK,
            TITLE,
            DESCRIPTION,
            START_DATE,
            DUE_DATE,
            P_PK,
            STEP_PK,
            ASSIGNER_PK,
            DEPARTMENT_PK,
            COMPANY_PK,
            grants,
            updateCols,
        };

        try {
            const flag = await this.workService.updateActionItem(bundle);

            if (flag) resExecutor(res, success, flag);
            else throw new AikoError('unknown error', 500, 500281);
        } catch (err) {
            if (err instanceof AikoError) throw resExecutor(res, err);
        }
    }

    @UseGuards(UserGuard)
    @Get('view-items')
    async viewItems(@Req() req: Request, @Res() res: Response) {
        const userPayload = usrPayloadParser(req);
        const { id } = req.query;
        let USER_PK = -1;
        const { COMPANY_PK } = userPayload;

        const numOrNaN = Number(id);
        if (numOrNaN && numOrNaN > 0) USER_PK = numOrNaN;

        try {
            const items = await this.workService.viewItems(USER_PK, COMPANY_PK);
            resExecutor(res, success, items);
        } catch (err) {
            if (err instanceof AikoError) throw resExecutor(res, err);
        }
    }
}
