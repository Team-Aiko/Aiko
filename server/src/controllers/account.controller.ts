import { Controller, Get, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Express } from 'express';
import { diskStorage } from 'multer';
import { ISignup } from '../interfaces/accountTypes';

@Controller('account')
export default class AccountController {
    @Get('/checkDuplicatedNickname')
    checkDuplicateNickname(@Req() req: Request): boolean {
        const { nickname } = req;
        return false;
    }

    @Post('/signup')
    @UseInterceptors(FileInterceptor('file'))
    signup(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
        const data = JSON.parse(req.body.obj) as ISignup;

        return false;
    }
}
