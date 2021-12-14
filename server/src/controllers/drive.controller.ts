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
import { AikoError, resExecutor, usrPayloadParser } from 'src/Helpers';
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
            throw resExecutor(res, { err });
        }
    }

    @Post('delete-folder')
    async deleteFolder(@Req() req: Request, @Res() res: Response) {
        try {
            const { COMPANY_PK, USER_PK } = usrPayloadParser(req);
            const { folderPK } = req.body;
            this.driveService.deleteFolder(folderPK, COMPANY_PK, USER_PK);
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    @Post('view-folder')
    async viewFolder(@Req() req: Request, @Res() res: Response) {
        try {
            const { COMPANY_PK } = usrPayloadParser(req);
            const { folderPK } = req.body;
            const result = await this.driveService.viewFolder(COMPANY_PK, folderPK);

            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    @Post('save-files')
    @UseInterceptors(FilesInterceptor('file', 100, driveFileOption))
    async saveFiles(@Req() req: Request, @Res() res: Response, @UploadedFiles() files: Express.Multer.File[]) {
        try {
            const { USER_PK, COMPANY_PK } = usrPayloadParser(req);
            const result = await this.driveService.saveFiles(Number(req.body.folderPK), USER_PK, COMPANY_PK, files);
            resExecutor(res, { result });
        } catch (err) {
            console.log('🚀 ~ file: drive.controller.ts ~ line 44 ~ DriveController ~ saveFiles ~ err', err);
            resExecutor(res, { err });
        }
    }

    @Get('get-files')
    async getFiles(@Req() req: Request, @Res() res: Response) {
        try {
            const { filePKs } = req.body;
            const { COMPANY_PK } = usrPayloadParser(req);
            const result = await this.driveService.getFiles(filePKs, COMPANY_PK);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    @Post('delete-files')
    async deleteFiles(@Req() req: Request, @Res() res: Response) {
        try {
            const { filePKs, folderPKs } = req.body;
            const primaryKeys: { filePKs: number | number[]; folderPKs: number | number[] } = {
                filePKs: filePKs || -1,
                folderPKs: folderPKs || -1,
            };
            const { USER_PK, COMPANY_PK } = usrPayloadParser(req);
            const result = await this.driveService.deleteFiles(primaryKeys, USER_PK, COMPANY_PK);
            resExecutor(res, { result });
        } catch (err) {
            console.log('🚀 ~ file: drive.controller.ts ~ line 69 ~ DriveController ~ deleteFiles ~ err', err);
            throw resExecutor(res, { err });
        }
    }
}
