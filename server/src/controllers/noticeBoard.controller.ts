import {
    Controller,
    Get,
    Post,
    Req,
    Res,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
    StreamableFile,
} from '@nestjs/common';
import NoticeBoardService from 'src/services/noticeBoard.service';
import { AikoError, success, resExecutor, usrPayloadParser } from 'src/Helpers';
import { UserGuard } from 'src/guard/user.guard';
import { FileInterceptor, FilesInterceptor, MulterModule } from '@nestjs/platform-express';
import { request, Response } from 'express';
import { createReadStream } from 'fs';
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
            const userPayload = JSON.parse(req.headers.userPayload);
            const title = req.body.title;
            const content = req.body.content;
            const userPk = userPayload.USER_PK;
            const comPk = userPayload.COMPANY_PK;
            await this.noticeboardService.createArtcle(title, content, userPk, comPk, files);
            throw resExecutor({ res, result: true });
        } catch (err) {
            throw resExecutor({ res }, err);
        }
    }

    @Post('update-article')
    async updateArticle(@Req() req, @Res() res) {
        try {
            const userPayload = usrPayloadParser(req);
            const title = req.body.title;
            const content = req.body.content;
            const userPk = userPayload.USER_PK;
            const num = req.body.num;
            await this.noticeboardService.updateArtcle(title, content, userPk, num);
            throw resExecutor({ res, result: true });
        } catch (err) {
            throw resExecutor({ res }, err);
        }
    }

    @Post('delete-article')
    async deleteArticle(@Req() req, @Res() res) {
        try {
            const userPayload = usrPayloadParser(req);
            const num = req.body.num;
            const userPk = userPayload.USER_PK;
            await this.noticeboardService.deleteArtcle(userPk, num);
            throw resExecutor({ res, result: true });
        } catch (err) {
            throw resExecutor({ res }, err);
        }
    }

    @Get('btn-size')
    async createBtnSize(@Req() req, @Res() res) {
        const userPayload = usrPayloadParser(req.headers.userPayload);
        const option = parseInt(req.query.option);
        const comPk = userPayload.COMPANY_PK;
        if (option === 10 || option === 20 || option === 30) {
            const result = await this.noticeboardService.createBtnSize(option, comPk);
            throw resExecutor({ res, result });
        } else {
            throw resExecutor({ res }); // 이거 에러처리 모르겠음
        }
    }

    @Get('list')
    async getList(@Req() req, @Res() res) {
        const userPayload = usrPayloadParser(req.headers.userPayload);
        const comPk = userPayload.COMPANY_PK;
        const option = parseInt(req.query.option);
        const pageNum = (parseInt(req.query.pageNum) - 1) * 10;
        if (comPk !== undefined && option >= 10 && pageNum >= 0) {
            const result = await this.noticeboardService.getList(option, comPk, pageNum);
            throw resExecutor({ res, result });
        } else {
            throw resExecutor({ res }, new AikoError('ERROR: 파라미터값 확인 필요', 451, 400000)); // 이거 에러처리 모르겠음
        }
    }

    @Get('detail')
    async getDetail(@Req() req, @Res() res) {
        const userPayload = usrPayloadParser(req.headers.userPayload);
        const num = parseInt(req.query.num);
        const userPk = userPayload.USER_PK;
        if (num !== undefined) {
            const result = await this.noticeboardService.getDetail(num, userPk);
            if (result === undefined) {
                throw resExecutor({ res }, new AikoError('ERROR: 해당 num 존재하지않음', 451, 400000)); // 이거 에러처리 모르겠음
            } else {
                throw resExecutor({ res, result });
            }
        } else {
            throw resExecutor({ res }, new AikoError('ERROR: 파라미터값 확인 필요', 451, 400000)); // 이거 에러처리 모르겠음
        }
    }

    // 파일 다운로드 테스트
    @Get('files')
    getFile(@Req() req, @Res() res: Response) {
        res.download('./files/noticeboard/hello.txt');
    }
}
