import {
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Post,
    Req,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Express, Response } from 'express';
import { ISignup, IAccountController, IResetPw } from '../interfaces';
import AccountService from '../services/account.service';
import { resExecutor, propsRemover } from '../Helpers/functions';
import { UserGuard } from 'src/guard/user.guard';

@Controller('account')
export default class AccountController {
    // private accountService: AccountService;

    constructor(private accountService: AccountService) {}

    // ! check complete - api doc
    @Get('checkDuplicateNickname')
    checkDuplicateNickname(@Req() req: Request, @Res() res: Response): void {
        const { nickname } = req.query;

        this.accountService
            .checkDuplicateNickname(nickname as string)
            .then((data) => {
                resExecutor(res, 'OK', 200, 200000, data);
            })
            .catch((err) => {
                console.error(err);
                resExecutor(res, 'error', 500, 5000001);
            });
    }

    // ! check complete - api doc
    @Get('checkDuplicateEmail')
    checkDuplicateEmail(@Req() req: Request, @Res() res: Response): void {
        const { email } = req.query;
        this.accountService
            .checkDuplicateEmail(email as string)
            .then((data) => {
                resExecutor(res, 'OK', 200, 200000, data);
            })
            .catch((err) => {
                console.error(err);
                resExecutor(res, 'error', 500, 5000001);
            });
    }

    // ! check complete - api doc
    @Get('country-list')
    getCountryList(@Req() req: Request, @Res() res: Response): void {
        const { str } = req.query;
        this.accountService
            .getCountryList(str as string)
            .then((data) => {
                resExecutor(res, 'OK', 200, 200000, data);
            })
            .catch((err) => {
                console.error(err);
                resExecutor(res, 'error', 500, 5000001);
            });
    }

    // ! check Complete - api doc
    @Post('signup')
    @UseInterceptors(FileInterceptor('file'))
    signup(@Req() req: Request, @UploadedFile() file: Express.Multer.File, @Res() res: Response): void {
        console.log(req.body.obj);
        const data = JSON.parse(req.body.obj) as ISignup;
        const imageRoute = file?.filename;
        this.accountService
            .signup(data, imageRoute)
            .then((data) => {
                resExecutor(res, 'OK', 200, 200000, data);
            })
            .catch((err) => {
                console.error(err);
                resExecutor(res, 'error', 500, 5000001);
            });
    }

    // ! check complete - api doc
    @Get('login-auth')
    grantLoginAuth(@Req() req: Request, @Res() res: Response): void {
        const { id } = req.query;
        this.accountService
            .grantLoginAuth(id as string)
            .then((data) => {
                resExecutor(res, 'OK', 200, 200000, data);
            })
            .catch((err) => {
                console.error(err);
                resExecutor(res, 'error', 500, 5000001);
            });
    }

    // ! check complete - api doc
    @Post('login')
    async login(@Req() req: Request, @Res() res: Response) {
        const data = {
            NICKNAME: req.body.NICKNAME,
            PASSWORD: req.body.PASSWORD,
        };

        try {
            const result = await this.accountService.login(data);
            if ('token' in result) {
                res.cookie('ACCESS_TOKEN', result.token);
                resExecutor(res, 'OK', 200, 200000, propsRemover(result, 'token'));
            } else {
                throw resExecutor(res, 'error', 500, 500001);
            }
        } catch (err) {
            throw resExecutor(res, 'error', 500, 500001);
        }
    }

    // ! check complete - doc api
    @Get('logout')
    logout(@Req() req: Request, @Res() res: Response): void {
        res.cookie('TOKEN', null);
        resExecutor(res, 'OK', 200, 200000, true);
    }

    // ! check complete - api doc
    @Post('findNickname')
    findNickname(@Req() req: Request, @Res() res: Response): void {
        const { email } = req.body;
        this.accountService
            .findNickname(email)
            .then((data) => {
                resExecutor(res, 'OK', 200, 200000, data);
            })
            .catch((err) => {
                console.error(err);
                resExecutor(res, 'error', 500, 5000001);
            });
    }

    // ! check complete - api doc
    @Post('requestResetPassword')
    requestResetPassword(@Req() req: Request, @Res() res: Response): void {
        const { email } = req.body;
        this.accountService
            .requestResetPassword(email)
            .then((data) => {
                resExecutor(res, 'OK', 200, 200000, data);
            })
            .catch((err) => {
                console.error(err);
                resExecutor(res, 'error', 500, 5000001);
            });
    }

    // ! check complete - api doc
    @Post('resetPassword')
    resetPassword(@Req() req: Request, @Res() res: Response): void {
        const { uuid, password }: IResetPw = req.body;
        this.accountService
            .resetPassword(uuid, password)
            .then((data) => {
                resExecutor(res, 'OK', 200, 200000, data);
            })
            .catch((err) => {
                console.error(err);
                resExecutor(res, 'error', 500, 5000001);
            });
    }

    // ! api doc
    @Post('getUserInfo')
    @UseGuards(UserGuard)
    getUserInfo(@Req() req: Request, @Res() res: Response): void {
        const { USER_PK, COMPANY_PK }: { USER_PK: number; COMPANY_PK: number } = req.body.userPayload;
        const { targetUserId } = req.body;

        this.accountService
            .getUserInfo(targetUserId, COMPANY_PK)
            .then((data) => {
                resExecutor(res, 'OK', 200, 200000, data);
            })
            .catch((err) => {
                console.error(err);
                resExecutor(res, 'error', 500, 5000001);
            });
    }
}
