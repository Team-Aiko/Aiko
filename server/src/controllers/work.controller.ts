import { Body, Controller, Get, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserGuard } from 'src/guard/user.guard';
import { resExecutor, usrPayloadParser } from 'src/Helpers';
import WorkService from 'src/services/work.service';
import { IItemBundle, IPaginationBundle } from 'src/interfaces/MVC/workMVC';
import { bodyChecker } from 'src/Helpers/functions';
import UserPayloadParserInterceptor from 'src/interceptors/userPayloadParser.interceptor';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';

@UseGuards(UserGuard)
@UseInterceptors(UserPayloadParserInterceptor)
@Controller('work')
export default class WorkController {
    constructor(private workService: WorkService) {}

    // ! api doc
    /**
     * 작성자: Aivyss
     * action item 생성 api
     */
    @Post('create-action-item')
    async createActionItem(@Req() req: Request, @Body('userPayload') userPayload: IUserPayload, @Res() res: Response) {
        try {
            const { OWNER_PK, TITLE, DESCRIPTION, DUE_DATE, START_DATE, P_PK, STEP_PK } = req.body;
            const { USER_PK, DEPARTMENT_PK, COMPANY_PK, grants } = userPayload;
            bodyChecker(
                { OWNER_PK, TITLE, DESCRIPTION, DUE_DATE, START_DATE, P_PK, STEP_PK },
                {
                    OWNER_PK: 'number',
                    TITLE: 'string',
                    DESCRIPTION: 'string',
                    DUE_DATE: 'number',
                    START_DATE: 'number',
                    P_PK: 'number',
                    STEP_PK: 'number',
                },
            );

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
            const result = await this.workService.createActionItem(bundle);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    @Post('delete-action-item')
    async deleteActionItem(@Req() req: Request, @Body('userPayload') userPayload: IUserPayload, @Res() res: Response) {
        try {
            const { ACTION_PK } = req.body;
            const { grants, DEPARTMENT_PK } = userPayload;
            bodyChecker({ ACTION_PK }, { ACTION_PK: 'number' });

            const result = await this.workService.deleteActionItem(ACTION_PK, DEPARTMENT_PK, grants);
            if (result) resExecutor(res, { result });
            else throw new Error();
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    @Post('update-action-item')
    async updateActionItem(@Req() req: Request, @Body('userPayload') userPayload: IUserPayload, @Res() res: Response) {
        try {
            const { ACTION_PK, OWNER_PK, TITLE, DESCRIPTION, START_DATE, DUE_DATE, P_PK, STEP_PK, updateCols } =
                req.body;
            const { USER_PK, grants, DEPARTMENT_PK, COMPANY_PK } = userPayload;
            const ASSIGNER_PK = USER_PK;
            bodyChecker(
                { ACTION_PK, OWNER_PK, TITLE, DESCRIPTION, START_DATE, DUE_DATE, P_PK, STEP_PK, updateCols },
                {
                    ACTION_PK: 'number',
                    OWNER_PK: 'number',
                    TITLE: 'string',
                    DESCRIPTION: 'string',
                    START_DATE: 'number',
                    DUE_DATE: 'number',
                    P_PK: 'number',
                    STEP_PK: 'number',
                    updateCols: 'string[]',
                },
            );

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
            const result = await this.workService.updateActionItem(bundle);

            if (result) resExecutor(res, { result });
            else throw new Error();
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    @Get('view-items')
    async viewItems(@Req() req: Request, @Body('userPayload') userPayload: IUserPayload, @Res() res: Response) {
        const { id, currentPage, feedsPerPage, groupCnt } = req.query;
        let USER_PK = -1;
        const { COMPANY_PK } = userPayload;

        const numOrNaN = Number(id);
        if (numOrNaN && numOrNaN > 0) USER_PK = numOrNaN;

        const bundle: IPaginationBundle = {
            USER_PK: Number(id) || USER_PK,
            COMPANY_PK,
            currentPage: Number(currentPage) || 1,
            feedsPerPage: Number(feedsPerPage) || 10,
            groupCnt: Number(groupCnt) || 5,
        };
        console.log('🚀 ~ file: work.controller.ts ~ line 98 ~ WorkController ~ viewItems ~ bundle', bundle);

        try {
            const result = await this.workService.viewItems(bundle);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }
}
