import { Controller, Get, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserGuard } from 'src/guard/user.guard';
import { resExecutor, usrPayloadParser } from 'src/Helpers';
import WorkService from 'src/services/work.service';
import { IItemBundle, IPaginationBundle } from 'src/interfaces/MVC/workMVC';

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
        const { OWNER_PK, TITLE, DESCRIPTION, DUE_DATE, START_DATE, P_PK, STEP_PK } = req.body;
        const { USER_PK, DEPARTMENT_PK, COMPANY_PK, grants } = usrPayloadParser(req);
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
            const result = await this.workService.createActionItem(bundle);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    @Post('delete-action-item')
    async deleteActionItem(@Req() req: Request, @Res() res: Response) {
        const { ACTION_PK } = req.body;
        const { grants, DEPARTMENT_PK } = usrPayloadParser(req);

        try {
            const result = await this.workService.deleteActionItem(ACTION_PK, DEPARTMENT_PK, grants);
            if (result) resExecutor(res, { result });
            else throw new Error();
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    @Post('update-action-item')
    async updateActionItem(@Req() req: Request, @Res() res: Response) {
        const { ACTION_PK, OWNER_PK, TITLE, DESCRIPTION, START_DATE, DUE_DATE, P_PK, STEP_PK, updateCols } = req.body;
        const { USER_PK, grants, DEPARTMENT_PK, COMPANY_PK } = usrPayloadParser(req);
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
            const result = await this.workService.updateActionItem(bundle);

            if (result) resExecutor(res, { result });
            else throw new Error();
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    @Get('view-items')
    async viewItems(@Req() req: Request, @Res() res: Response) {
        const { id, currentPage, feedsPerPage, groupCnt } = req.query;
        let USER_PK = -1;
        const { COMPANY_PK } = usrPayloadParser(req);

        const numOrNaN = Number(id);
        if (numOrNaN && numOrNaN > 0) USER_PK = numOrNaN;

        const bundle: IPaginationBundle = {
            USER_PK,
            COMPANY_PK,
            currentPage: Number(currentPage) | 1,
            feedsPerPage: Number(feedsPerPage) | 10,
            groupCnt: Number(groupCnt) | 5,
        };

        try {
            const result = await this.workService.viewItems(bundle);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }
}
