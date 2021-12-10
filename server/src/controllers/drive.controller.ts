import {
    Controller,
    Get,
    Post,
    Req,
    Res,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { UserGuard } from 'src/guard/user.guard';
import { resExecutor, usrPayloadParser } from 'src/Helpers';
import { driveFileOption, filePath } from 'src/interfaces/MVC/fileMVC';
import DriveService from 'src/services/drive.service';

@UseGuards(UserGuard)
@Controller() // /store/drive
export default class DriveController {
    constructor(private driveService: DriveService) {}

    @Post('create-folder')
    async createFolder(@Req() req: Request, @Res() res: Response) {
        try {
            const { COMPANY_PK } = usrPayloadParser(req);
            const { folderName, parentPK } = req.body;
            const result = await this.driveService.createFolder(COMPANY_PK, folderName, parentPK);
            resExecutor(res, { result });
        } catch (err) {
            resExecutor(res, { err });
        }
    }

    @Post('save-files')
    @UseInterceptors(FilesInterceptor('file', 100, driveFileOption))
    async saveFiles(@Req() req: Request, @Res() res: Response, @UploadedFiles() files: Express.Multer.File[]) {
        try {
            const { USER_PK } = usrPayloadParser(req);
            const result = await this.driveService.saveFiles(Number(req.body.folderPK), USER_PK, files);
            resExecutor(res, { result });
        } catch (err) {
            resExecutor(res, { err });
        }
    }

    @Get('get-files')
    async getFiles(@Req() req: Request, @Res() res: Response) {
        try {
            const { filePKs } = req.body;
            const result = await this.driveService.getFiles(filePKs);
            resExecutor(res, { result });
        } catch (err) {
            resExecutor(res, { err });
        }
    }
}
