import { Controller, Get, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Express, Response } from 'express';
import { ISignup, IAccountController, IResetPw } from '../interfaces';
import AccountService from '../services/account.service';

@Controller('account')
export default class AccountController implements IAccountController {
    // private accountService: AccountService;

    constructor(private accountService: AccountService) {}

    // ! check complete
    @Get('checkDuplicateNickname')
    checkDuplicateNickname(@Req() req: Request, @Res() res: Response): void {
        const { nickname } = req.query;
        this.accountService.checkDuplicateNickname(nickname as string, res);
    }

    // ! check complete
    @Get('checkDuplicateEmail')
    checkDuplicateEmail(@Req() req: Request, @Res() res: Response): void {
        const { email } = req.query;
        this.accountService.checkDuplicateEmail(email as string, res);
    }

    // ! check complete
    @Get('country-list')
    getCountryList(@Req() req: Request, @Res() res: Response): void {
        const { str } = req.query;
        this.accountService.getCountryList(str as string, res);
    }

    // ! check Complete
    @Post('signup')
    @UseInterceptors(FileInterceptor('file'))
    signup(@Req() req: Request, @UploadedFile() file: Express.Multer.File, @Res() res: Response): void {
        console.log(req.body.obj);
        const data = JSON.parse(req.body.obj) as ISignup;
        const imageRoute = file?.filename;
        this.accountService.signup(data, imageRoute, res);
    }

    // ! check complete
    @Get('login-auth')
    grantLoginAuth(@Req() req: Request, @Res() res: Response): void {
        const { id } = req.query;
        this.accountService.grantLoginAuth(id as string, res);
    }

    // ! check complete
    @Post('login')
    login(@Req() req: Request, @Res() res: Response): void {
        const data = {
            NICKNAME: req.body.NICKNAME,
            PASSWORD: req.body.PASSWORD,
        };
        this.accountService.login(data, res);
    }

    // ! check complete
    @Get('logout')
    logout(@Req() req: Request, @Res() res: Response): void {
        this.accountService.logout(res);
    }

    // ! check complete
    @Post('findNickname')
    findNickname(@Req() req: Request, @Res() res: Response): void {
        const { email } = req.body;
        this.accountService.findNickname(email, res);
    }

    // ! check complete
    @Post('requestResetPassword')
    requestResetPassword(@Req() req: Request, @Res() res: Response): void {
        const { email } = req.body;
        this.accountService.requestResetPassword(email, res);
    }

    // ! check complete
    @Post('resetPassword')
    resetPassword(@Req() req: Request, @Res() res: Response): void {
        const { uuid, password }: IResetPw = req.body;
        this.accountService.resetPassword(uuid, password, res);
    }

    @Post('getUserInfo')
    getUserInfo(@Req() req: Request, @Res() res: Response): void {
        const { userPK, TOKEN } = req.body;
        this.accountService.getUser(Number(userPK), TOKEN, res);
    }
}
