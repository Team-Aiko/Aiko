import { Controller, Get, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Express, Response } from 'express';
import { ISignup, IAccountController, IResetPw } from '../interfaces';
import AccountService from '../services/account.service';
import { getResPacket } from '../Helpers/functions';

@Controller('account')
export default class AccountController {
    // private accountService: AccountService;

    constructor(private accountService: AccountService) {}

    // ! check complete
    @Get('checkDuplicateNickname')
    checkDuplicateNickname(@Req() req: Request, @Res() res: Response): void {
        const { nickname } = req.query;

        this.accountService
            .checkDuplicateNickname(nickname as string)
            .then((data) => {
                res.send(getResPacket('OK', 200, 2000000, data));
            })
            .catch((err) => {
                console.error(err);
                res.send(getResPacket('error', 500, 5000001));
            });
    }

    // ! check complete
    @Get('checkDuplicateEmail')
    checkDuplicateEmail(@Req() req: Request, @Res() res: Response): void {
        const { email } = req.query;
        this.accountService
            .checkDuplicateEmail(email as string)
            .then((data) => {
                res.send(getResPacket('OK', 200, 2000000, data));
            })
            .catch((err) => {
                console.error(err);
                res.send(getResPacket('error', 500, 5000001));
            });
    }

    // ! check complete
    @Get('country-list')
    getCountryList(@Req() req: Request, @Res() res: Response): void {
        const { str } = req.query;
        this.accountService
            .getCountryList(str as string)
            .then((data) => {
                res.send(getResPacket('OK', 200, 2000000, data));
            })
            .catch((err) => {
                console.error(err);
                res.send(getResPacket('error', 500, 5000001));
            });
    }

    // ! check Complete
    @Post('signup')
    @UseInterceptors(FileInterceptor('file'))
    signup(@Req() req: Request, @UploadedFile() file: Express.Multer.File, @Res() res: Response): void {
        console.log(req.body.obj);
        const data = JSON.parse(req.body.obj) as ISignup;
        const imageRoute = file?.filename;
        this.accountService
            .signup(data, imageRoute)
            .then((data) => {
                res.send(getResPacket('OK', 200, 2000000, data));
            })
            .catch((err) => {
                console.error(err);
                res.send(getResPacket('error', 500, 5000001));
            });
    }

    // ! check complete
    @Get('login-auth')
    grantLoginAuth(@Req() req: Request, @Res() res: Response): void {
        const { id } = req.query;
        this.accountService
            .grantLoginAuth(id as string)
            .then((data) => {
                res.send(getResPacket('OK', 200, 2000000, data));
            })
            .catch((err) => {
                console.error(err);
                res.send(getResPacket('error', 500, 5000001));
            });
    }

    // ! check complete
    @Post('login')
    login(@Req() req: Request, @Res() res: Response): void {
        const data = {
            NICKNAME: req.body.NICKNAME,
            PASSWORD: req.body.PASSWORD,
        };
        this.accountService
            .login(data)
            .then((data) => {
                if ('token' in data) {
                    res.cookie('TOKEN', data.token);
                    data.token = '';
                    res.send(getResPacket('OK', 200, 2000000, data));
                } else {
                    res.send(getResPacket('error', 500, 5000002, data));
                }
            })
            .catch((err) => {
                console.error(err);
                res.send(getResPacket('error', 500, 5000001));
            });
    }

    // ! check complete
    @Get('logout')
    logout(@Req() req: Request, @Res() res: Response): void {
        res.cookie('TOKEN', null);
        res.send(true);
    }

    // ! check complete
    @Post('findNickname')
    findNickname(@Req() req: Request, @Res() res: Response): void {
        const { email } = req.body;
        this.accountService
            .findNickname(email)
            .then((data) => {
                res.send(getResPacket('OK', 200, 2000000, data));
            })
            .catch((err) => {
                console.error(err);
                res.send(getResPacket('error', 500, 5000001));
            });
    }

    // ! check complete
    @Post('requestResetPassword')
    requestResetPassword(@Req() req: Request, @Res() res: Response): void {
        const { email } = req.body;
        this.accountService
            .requestResetPassword(email)
            .then((data) => {
                res.send(getResPacket('OK', 200, 2000000, data));
            })
            .catch((err) => {
                console.error(err);
                res.send(getResPacket('error', 500, 5000001));
            });
    }

    // ! check complete
    @Post('resetPassword')
    resetPassword(@Req() req: Request, @Res() res: Response): void {
        const { uuid, password }: IResetPw = req.body;
        this.accountService
            .resetPassword(uuid, password)
            .then((data) => {
                res.send(getResPacket('OK', 200, 2000000, data));
            })
            .catch((err) => {
                console.error(err);
                res.send(getResPacket('error', 500, 5000001));
            });
    }

    @Post('getUserInfo')
    getUserInfo(@Req() req: Request, @Res() res: Response): void {
        const { userPK, TOKEN } = req.body;
        this.accountService
            .getUserInfo(userPK)
            .then((data) => {
                res.send(getResPacket('OK', 200, 2000000, data));
            })
            .catch((err) => {
                console.error(err);
                res.send(getResPacket('error', 500, 5000001));
            });
    }
}
