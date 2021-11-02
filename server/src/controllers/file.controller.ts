import {
    Controller,
    Post,
    Req,
    Res,
    UseInterceptors,
    UploadedFile,
    Get,
    Param,
    UseGuards,
    Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import FileService from 'src/services/file.service';
import { AikoError, success, resExecutor, unknownError } from 'src/Helpers';
import { UserGuard } from 'src/guard/user.guard';
import { filePath, IFileBundle } from 'src/interfaces/MVC/fileMVC';

@UseGuards(UserGuard)
@Controller('store')
export default class FileController {
    readonly success = success;

    constructor(private fileService: FileService) {}

    /**
     * 챗에 파일을 전송할 때는 rdb에 저장한다. 그리고 pk를 반환하고 그것을 소켓에 전송한다.
     * 수신자는 file이라는 property가 존재할 경우 파일을 rdb로부터 조회하여 화면에 뿌려준다.
     * @param req
     * @param file
     * @param s
     */
    @Post('files-on-chat-msg')
    @UseInterceptors(FileInterceptor('file', { dest: filePath.CHAT }))
    async uploadFilesOnChatMsg(@Req() req: Request, file: Express.Multer.File, @Res() res: Response) {
        try {
            const { chatRoomId } = req.body;
            const { filename, originalname, size } = file;
            const bundle: IFileBundle = {
                FILE_NAME: filename,
                ORIGINAL_NAME: originalname,
                FILE_SIZE: size,
            };

            const data = await this.fileService.uploadFilesOnChatMsg(bundle, chatRoomId as string);
            resExecutor(res, this.success, data);
        } catch (err) {
            throw resExecutor(res, err instanceof AikoError ? err : unknownError);
        }
    }

    /**
     * 파일 아이디를 이용해 채팅에 업로드 된 파일의 정보를 불러오는 메소드
     * @param req
     * @param res
     */
    @Get('view-chat-file-info')
    async viewFilesOnChatMsg(@Param('fileId') fileId: string, @Res() res: Response) {
        try {
            const { FILE_NAME, ORIGINAL_NAME, FILE_SIZE } = await this.fileService.viewFilesOnChatMsg(Number(fileId));
            resExecutor(res, success, { FILE_NAME, ORIGINAL_NAME, FILE_SIZE } as IFileBundle);
        } catch (err) {
            throw resExecutor(res, err instanceof AikoError ? err : unknownError);
        }
    }

    /**
     * 채팅에서 공유된 파일을 실제로 다운로드하는 api
     * @param fileId
     * @param res
     */
    @Get('download-chat-file')
    async downloadChatFile(@Param('fileId') fileId: string, @Res() res: Response) {
        try {
            const { FILE_NAME, ORIGINAL_NAME } = await this.fileService.viewFilesOnChatMsg(Number(fileId));
            res.download(`${filePath.CHAT}${FILE_NAME}`, ORIGINAL_NAME);
        } catch (err) {
            throw resExecutor(res, err instanceof AikoError ? err : unknownError);
        }
    }

    /**
     * 유저의 프로필 이미지를 불러오기위해 사용하는 api
     * 용례: <img src='/api/store/download-profile-file?fileId=1' />
     * @param fileId
     * @param res
     */
    @Get('download-profile-file')
    async downloadProfileFile(@Query('fileId') fileId: string, @Res() res: Response) {
        try {
            const { FILE_NAME, ORIGINAL_NAME } = await this.fileService.viewProfileFile(Number(fileId));
            res.download(`${filePath.PROFILE}${FILE_NAME}`, ORIGINAL_NAME);
        } catch (err) {
            throw resExecutor(res, err instanceof AikoError ? err : unknownError);
        }
    }
}
