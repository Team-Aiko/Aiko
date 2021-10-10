import { Controller, Get, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Express, Response } from 'express';
import { ISignup, IAccountController } from '../interfaces/accountTypes';
import AccountService from '../services/account.service';

@Controller('account')
export default class AccountController implements IAccountController {
    // private accountService: AccountService;

    constructor(private accountService: AccountService) {}

    @Get('checkDuplicatedNickname')
    checkDuplicateNickname(@Req() req: Request, @Res() res: Response): void {
        const { nickname } = req.query;
        this.accountService.checkDuplicateNickname(nickname as string, res);
    }

    @Get('checkDuplicatedEmail')
    checkDuplicateEmail(@Req() req: Request, @Res() res: Response): void {
        const { email } = req.query;
        this.accountService.checkDuplicateEmail(email as string, res);
    }

    @Get('getCountryList')
    getCountryList(@Req() req: Request, @Res() res: Response): void {
        const { str } = req.query;
        this.accountService.getCountryList(str as string, res);
    }

    @Post('/signup')
    @UseInterceptors(FileInterceptor('file'))
    signup(@Req() req: Request, @UploadedFile() file: Express.Multer.File, @Res() res: Response): void {
        const data = JSON.parse(req.body.obj) as ISignup;
        const imageRoute = file.filename;
        this.accountService.signup(data, imageRoute, res);
    }

    grantLoginAuth(@Req() req: Request, @Res() res: Response): void {
        const { id } = req.query;
        this.accountService.grantLoginAuth(id as string, res);
        throw new Error('Method not implemented.');
    }

    login(@Req() req: Request, @Res() res: Response): void {
        throw new Error('Method not implemented.');
    }
    logout(@Req() req: Request, @Res() res: Response): void {
        throw new Error('Method not implemented.');
    }
    findNickname(@Req() req: Request, @Res() res: Response): void {
        throw new Error('Method not implemented.');
    }
    requestResetPassword(@Req() req: Request, @Res() res: Response): void {
        throw new Error('Method not implemented.');
    }
    resetPassword(@Req() req: Request, @Res() res: Response): void {
        throw new Error('Method not implemented.');
    }
    generateLoginToken(@Req() req: Request, @Res() res: Response): string {
        throw new Error('Method not implemented.');
    }
    getUser(@Req() req: Request, @Res() res: Response): void {
        throw new Error('Method not implemented.');
    }
}
