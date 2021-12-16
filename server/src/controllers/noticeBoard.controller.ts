import { Controller, Get, Post, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import NoticeBoardService from 'src/services/noticeBoard.service';
import { AikoError, resExecutor, usrPayloadParser } from 'src/Helpers';
import { UserGuard } from 'src/guard/user.guard';
import { FileInterceptor, FilesInterceptor, MulterModule } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { NoticeBoardFileOption } from 'src/interfaces/MVC/fileMVC';
import { deleteFiles } from 'src/Helpers/functions';

@UseGuards(UserGuard)
@Controller('notice-board')
export default class NoticeBoardController {
    constructor(private noticeboardService: NoticeBoardService) {}

    // ! api doc
    @Post('write')
    @UseInterceptors(FilesInterceptor('file', 3, NoticeBoardFileOption))
    async createArticle(@Req() req: Request, @Res() res: Response, @UploadedFiles() files: Express.Multer.File[]) {
        console.log('hello');
        try {
            console.log(files); //merge  test
            const obj = JSON.parse(req.body.obj);
            const userPayload = usrPayloadParser(req);
            const title = obj.title;

            const content = obj.content;
            const userPk = userPayload.USER_PK;
            const comPk = userPayload.COMPANY_PK;
            // const originalName = files.map((file) => file.originalname);
            await this.noticeboardService.createArtcle(title, content, userPk, comPk, files);
            resExecutor(res, { result: true });
            console.log(files[0]);
        } catch (err) {
            console.log(err);
            const uuid = files.map((file) => file.filename);
            deleteFiles(files[0].destination, ...uuid);
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    @Post('update-article')
    @UseInterceptors(FilesInterceptor('file', 3, NoticeBoardFileOption))
    async updateArticle(@Req() req: Request, @Res() res: Response, @UploadedFiles() files: Express.Multer.File[]) {
        try {
            const obj = JSON.parse(req.body.obj);
            const userPayload = usrPayloadParser(req);
            const title = obj.title;
            const content = obj.content;
            const userPk = userPayload.USER_PK;
            const comPk = userPayload.COMPANY_PK;
            const num = obj.num;
            const delFilePks = obj.delFilePks;
            await this.noticeboardService.updateArtcle(title, content, userPk, comPk, num, delFilePks, files);
            resExecutor(res, { result: true });
        } catch (err) {
            const uuid = files.map((file) => file.filename);
            deleteFiles(files[0].destination, ...uuid);
            console.log(err);
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    @Post('delete-article')
    async deleteArticle(@Req() req: Request, @Res() res: Response) {
        try {
            const userPayload = usrPayloadParser(req);
            const num = req.body.num;
            const userPk = userPayload.USER_PK;
            await this.noticeboardService.deleteArtcle(userPk, num);
            resExecutor(res, { result: true });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    @Get('btn-size')
    async createBtnSize(@Req() req: Request, @Res() res: Response) {
        const userPayload = usrPayloadParser(req);
        const option = parseInt(req.query.option as string);
        const comPk = userPayload.COMPANY_PK;
        if (option === 10 || option === 20 || option === 30) {
            const result = await this.noticeboardService.createBtnSize(option, comPk);
            resExecutor(res, { result: result }); // 에러가 아닌데 throw...? 모르겠음;;
        } else {
            throw resExecutor(res); // 이거 에러처리 모르겠음
        }
    }

    // ! api doc
    @Get('list')
    async getList(@Req() req: Request, @Res() res: Response) {
        const userPayload = usrPayloadParser(req);
        const comPk = userPayload.COMPANY_PK;
        const option = parseInt(req.query.option as string);
        const pageNum = (parseInt(req.query.pageNum as string) - 1) * 10;
        if (comPk !== undefined && option >= 10 && pageNum >= 0) {
            const result = await this.noticeboardService.getList(option, comPk, pageNum);
            resExecutor(res, { result });
        } else {
            throw resExecutor(res, { err: new AikoError('ERROR: 파라미터값 확인 필요', 451, 400000) }); // 이거 에러처리 모르겠음
        }
    }

    // ! api doc
    @Get('detail')
    async getDetail(@Req() req: Request, @Res() res: Response) {
        const userPayload = usrPayloadParser(req);
        const num = parseInt(req.query.num as string);
        const comPk = userPayload.COMPANY_PK;
        if (num !== undefined) {
            const result = await this.noticeboardService.getDetail(num, comPk);
            if (result === undefined) {
                throw resExecutor(res, { err: new AikoError('ERROR: 해당 num 존재하지않음', 451, 400000) }); // 이거 에러처리 모르겠음
            } else {
                resExecutor(res, { result: result });
            }
        } else {
            throw resExecutor(res, { err: new AikoError('ERROR: 파라미터값 확인 필요', 451, 400000) }); // 이거 에러처리 모르겠음
        }
    }
}
