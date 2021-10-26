import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
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
            const comPk = req.body.userPayload.COMPANY_PK;
            await this.noticeboardService.createArtcle(title, content, userPk, comPk);
            resExecutor(res, this.success, true);
        } catch (err) {
            resExecutor(res, new AikoError('ERROR:' + err.name, 451, 400000));
        }
    }

    @UseGuards(UserGuard)
    @Post('update-article')
    async updateArticle(@Req() req, @Res() res) {
        try {
            const title = req.body.title;
            const content = req.body.content;
            const userPk = req.body.userPayload.USER_PK;
            const num = req.body.num;
            await this.noticeboardService.updateArtcle(title, content, userPk, num);
            resExecutor(res, this.success, true);
        } catch (err) {
            throw resExecutor(res, new AikoError('ERROR:' + err.name, 451, 400000));
        }
    }

    @UseGuards(UserGuard)
    @Post('delete-article')
    async deleteArticle(@Req() req, @Res() res) {
        try {
            const num = req.body.num;
            const userPk = req.body.userPayload.USER_PK;
            await this.noticeboardService.deleteArtcle(userPk, num);
            resExecutor(res, this.success, true);
        } catch (err) {
            throw resExecutor(res, new AikoError('ERROR:' + err.name, 451, 400000));
        }
    }

    @UseGuards(UserGuard)
    @Get('btn-size')
    async createBtnSize(@Req() req, @Res() res) {
        const option = req.body.option;
        const comPk = req.body.userPayload.COMPANY_PK;
        try {
            if (option === 10 || option === 20 || option === 30) {
                const maxBtn = await this.noticeboardService.createBtnSize(option, comPk);
                resExecutor(res, this.success, maxBtn);
            } else {
                throw resExecutor(res, new AikoError('ERROR:' + 'option value error', 451, 400000));
            }
        } catch (err) {
            throw resExecutor(res, new AikoError('ERROR:' + err.name, 451, 400000));
        }
    }

    // @UseGuards(UserGuard)
    // @Get('list')
    // async getList(@Req() req, @Res() res) {
    //     try {
    //         const num = req.body.num;
    //         const userPk = req.body.userPayload.USER_PK;
    //         await this.noticeboardService.getList(userPk, num);
    //         resExecutor(res, this.success, true);
    //     } catch (err) {
    //         resExecutor(res, new AikoError('ERROR:' + err.name, 451, 400000));
    //     }
    // }
}