import { Controller, Post, Req, Res } from '@nestjs/common';

import NoticeBoardService from 'src/services/noticeBoard.service';

@Controller('notice-board')
export default class NoticeBoardController {
    constructor(private noticeboardService: NoticeBoardService) {}

    @Post('write')
    async createArticle(@Req() req, @Res() res) {
        const title = req.body.title;
        const content = req.body.content;
        const userPk = req.body.userPayload.USER_PK;
        const result = await this.noticeboardService.createArtcle(title, content, userPk);
        console.log(result);
    }
}