import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AikoError } from 'src/Helpers/classes';
import NoticeBoardService from 'src/services/noticeBoard.service';
import { resExecutor } from 'src/Helpers/functions';
import { UserGuard } from 'src/guard/user.guard';
@Controller('notice-board')
export default class NoticeBoardController {
    constructor(private noticeboardService: NoticeBoardService) {}
    readonly success = new AikoError('OK', 200, 200000);

    @UseGuards(UserGuard)
    @Post('write')
    async createArticle(@Req() req, @Res() res) {
        try {
            const title = req.body.title;
            const content = req.body.content;
            const userPk = req.body.userPayload.USER_PK;
            await this.noticeboardService.createArtcle(title, content, userPk);
            resExecutor(res, this.success, true);
        } catch (err) {
            resExecutor(res, new AikoError('ERROR:' + err.name, 451, 400000));
        }
    }
}