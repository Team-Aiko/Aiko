import { Controller, Post, Req, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { IFileController } from 'src/interfaces';
import FileService from 'src/services/file.service';
import { resExecutor } from '../Helpers/functions';

@Controller('store')
export default class FileController implements IFileController {
    constructor(private fileService: FileService) {}

    /**
     * 챗에 파일을 전송할 때는 rdb에 저장한다. 그리고 pk를 반환하고 그것을 소켓에 전송한다.
     * 수신자는 file이라는 property가 존재할 경우 파일을 rdb로부터 조회하여 화면에 뿌려준다.
     * @param req
     * @param file
     * @param s
     */
    @Post('files-on-chat-msg')
    @UseInterceptors(FileInterceptor('file', { dest: './files/chatFiles' }))
    uploadFilesOnChatMsg(@Req() req: Request, file: Express.Multer.File, @Res() res: Response) {
        const fileName = file?.filename;
        const { chatRoomId } = req.body as { chatRoomId: string };

        this.fileService
            .uploadFilesOnChatMsg(fileName, chatRoomId)
            .then((data) => resExecutor(res, 'OK', 200, 200000, data))
            .catch((err) => {
                resExecutor(res, 'database insert error', 500, 5000002);
                console.error(err);
            });
    }

    /**
     * 파일 아이디로부터 파일의 저장위치를 불러오는 api
     * @param req
     * @param res
     */
    @Post('view-files')
    viewFilesOnChatMsg(@Req() req: Request, @Res() res: Response): void {
        const { fileId } = req.body as { fileId: number };
        this.fileService
            .viewFilesOnChatMsg(fileId)
            .then((data) => resExecutor(res, 'OK', 200, 200000, data))
            .catch((err) => {
                resExecutor(res, 'database select error', 500, 5000001);
                console.error(err);
            });
    }
}
