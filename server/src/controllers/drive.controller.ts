import { Body, Controller, Get, Post, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { UserGuard } from 'src/guard/user.guard';
import { resExecutor } from 'src/Helpers';
import { bodyChecker } from 'src/Helpers/functions';
import UserPayloadParserInterceptor from 'src/interceptors/userPayloadParser.interceptor';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';
import { driveFileOption } from 'src/interfaces/MVC/fileMVC';
import DriveService from 'src/services/drive.service';

@UseGuards(UserGuard)
@UseInterceptors(UserPayloadParserInterceptor)
@Controller() // /store/drive
export default class DriveController {
    constructor(private driveService: DriveService) {}

    // ! api doc
    @Post('create-folder')
    async createFolder(@Req() req: Request, @Body('userPayload') userPayload: IUserPayload, @Res() res: Response) {
        try {
            const { folderName, parentPK } = req.body;
            const { COMPANY_PK } = userPayload;
            bodyChecker({ folderName, parentPK }, { folderName: ['string'], parentPK: ['number', 'undefined'] });

            const result = await this.driveService.createFolder(COMPANY_PK, folderName, parentPK);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    @Get('view-folder')
    async viewFolder(@Req() req: Request, @Body('userPayload') userPayload: IUserPayload, @Res() res: Response) {
        try {
            const { folderId } = req.query;
            const { COMPANY_PK } = userPayload;

            const result = this.driveService.viewFolder(COMPANY_PK, Number(folderId));

            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    @Post('save-files')
    @UseInterceptors(FilesInterceptor('file', 100, driveFileOption), UserPayloadParserInterceptor)
    async saveFiles(
        @Req() req: Request,
        @Body('userPayload') userPayload: IUserPayload,
        @Res() res: Response,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        try {
            const { USER_PK, COMPANY_PK } = userPayload;
            const result = await this.driveService.saveFiles(Number(req.body.folderPK), USER_PK, COMPANY_PK, files);
            resExecutor(res, { result });
        } catch (err) {
            console.log('🚀 ~ file: drive.controller.ts ~ line 44 ~ DriveController ~ saveFiles ~ err', err);
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    @Get('get-files')
    async getFiles(@Req() req: Request, @Body('userPayload') userPayload: IUserPayload, @Res() res: Response) {
        try {
            const { filePKs } = req.body;
            const { COMPANY_PK } = userPayload;

            bodyChecker({ filePKs }, { filePKs: ['number', 'number[]'] });

            const result = await this.driveService.getFiles(filePKs, COMPANY_PK);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    @Post('delete-files')
    async deleteFiles(@Req() req: Request, @Body('userPayload') userPayload: IUserPayload, @Res() res: Response) {
        try {
            const { filePKs, folderPKs } = req.body;
            bodyChecker({ filePKs, folderPKs }, { filePKs: ['number', 'number[]'], folderPKs: ['number', 'number[]'] });
            const primaryKeys: { filePKs: number | number[]; folderPKs: number | number[] } = {
                filePKs: filePKs || -1,
                folderPKs: folderPKs || -1,
            };
            const { USER_PK, COMPANY_PK } = userPayload;
            const result = await this.driveService.deleteFiles(primaryKeys, USER_PK, COMPANY_PK);
            resExecutor(res, { result });
        } catch (err) {
            console.log('🚀 ~ file: drive.controller.ts ~ line 69 ~ DriveController ~ deleteFiles ~ err', err);
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    @Post('move-folder')
    async moveFolder(@Req() req: Request, @Body('userPayload') userPayload: IUserPayload, @Res() res: Response) {
        try {
            const { fromFilePKs, fromFolderPKs, toFolderPK } = req.body;
            const { COMPANY_PK } = userPayload;
            bodyChecker(
                { fromFilePKs, fromFolderPKs, toFolderPK },
                { fromFilePKs: ['number[]'], fromFolderPKs: ['number[]'], toFolderPK: ['number'] },
            );

            const result = await this.driveService.moveFolder(fromFilePKs, fromFolderPKs, toFolderPK, COMPANY_PK);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }
}
