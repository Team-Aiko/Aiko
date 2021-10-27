import { Controller, Get, Post, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import NoticeBoardService from 'src/services/noticeBoard.service';
import { AikoError, success, resExecutor } from 'src/Helpers';
import { UserGuard } from 'src/guard/user.guard';
import { FileInterceptor, FilesInterceptor, MulterModule } from '@nestjs/platform-express';
@UseGuards(UserGuard)
@Controller('notice-board')
export default class NoticeBoardController {
    readonly success = success;

    constructor(private noticeboardService: NoticeBoardService) {}

    // fileWriter(@UploadedFile() file) {
    //     const response = {
    //         originalname: file.originalname,
    //         filename: file.filename,
    //     };
    //     console.log(file);
    //     return response;
    // }

    @Post('write')
    @UseInterceptors(FilesInterceptor('file'))
    async createArticle(@Req() req, @Res() res, @UploadedFiles() files) {
        try {
            const title = req.body.title;
            const content = req.body.content;
            console.log(req);
            const userPk = req.body.userPayload.USER_PK; // 에러
            const comPk = req.body.userPayload.COMPANY_PK; // 에러
            await this.noticeboardService.createArtcle(title, content, userPk, comPk, files);
            resExecutor(res, this.success, true);
        } catch (err) {
            console.log(err);
            throw resExecutor(res, new AikoError('ERROR:' + err.name, 451, 400000));
        }
    }

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

    @Get('btn-size')
    async createBtnSize(@Req() req, @Res() res) {
        const option = parseInt(req.query.option);
        const comPk = req.body.userPayload.COMPANY_PK;
        if (option === 10 || option === 20 || option === 30) {
            const maxBtn = await this.noticeboardService.createBtnSize(option, comPk);
            resExecutor(res, this.success, maxBtn);
        } else {
            throw resExecutor(res, new AikoError('ERROR: option value', 451, 400000));
        }
    }

    @Get('list')
    async getList(@Req() req, @Res() res) {
        const comPk = req.body.userPayload.COMPANY_PK;
        const option = parseInt(req.query.option);
        const pageNum = (parseInt(req.query.pageNum) - 1) * 10;
        if (comPk !== undefined && option >= 10 && pageNum >= 0) {
            const result = await this.noticeboardService.getList(option, comPk, pageNum);
            resExecutor(res, this.success, result);
        } else {
            throw resExecutor(res, new AikoError('ERROR: 파라미터값 확인 필요', 451, 400000));
        }
    }

    @Get('detail')
    async getDetail(@Req() req, @Res() res) {
        const num = parseInt(req.query.num);
        const userPk = req.body.userPayload.USER_PK;
        if (num !== undefined) {
            const result = await this.noticeboardService.getDetail(num, userPk);
            if (result === undefined) {
                throw resExecutor(res, new AikoError('ERROR: 해당 num 존재하지않음', 451, 400000));
            } else {
                resExecutor(res, this.success, result);
            }
        } else {
            throw resExecutor(res, new AikoError('ERROR: 파라미터값 확인 필요', 451, 400000));
        }
    }
}
