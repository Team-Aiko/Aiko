import { Controller, Get, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { Pagination } from 'src/Helpers/classes';
import { bodyChecker, resExecutor } from 'src/Helpers/functions';

@Controller('test')
export default class TestController {
    @Post('pagination')
    async testPagination(@Req() req: Request, @Res() res: Response) {
        const { currentPage, feedPerPage } = req.body;
        const pagination = new Pagination(currentPage, 150, feedPerPage);
        res.send(pagination);
    }

    @Post('body-checker')
    async testBodyChecker(@Req() req: Request, @Res() res: Response) {
        try {
            console.log(req.body);
            const result = bodyChecker(req.body, { a: 'string', b: 'string[]', c: 'number', d: 'number[]' });
            resExecutor(res, { result });
        } catch (err) {
            console.error(err);
            throw resExecutor(res, { err });
        }
    }
}
