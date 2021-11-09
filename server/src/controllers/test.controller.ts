import { Controller, Get, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { Pagination } from 'src/Helpers/classes';

@Controller('test')
export default class TestController {
    @Post('pagination')
    async testPagination(@Req() req: Request, @Res() res: Response) {
        const { currentPage, feedPerPage } = req.body;
        const pagination = new Pagination(currentPage, 150, feedPerPage);
        res.send(pagination);
    }
}
