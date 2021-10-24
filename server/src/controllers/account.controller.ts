import { Controller, Get, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Express, Response } from 'express';
import { ISignup, IAccountController, IResetPw } from '../interfaces';
import AccountService from '../services/account.service';
import { resExecutor, propsRemover } from '../Helpers/functions';
import { UserGuard } from 'src/guard/user.guard';
import { AikoError } from 'src/Helpers/classes';
@Controller('account')
export default class AccountController {
    // private accountService: AccountService;
    readonly success = new AikoError('OK', 200, 200000);
    readonly fail = new AikoError('ERROR', 500, 500000);
    constructor(private accountService: AccountService) {}

    // ! check complete - api doc
    @Get('checkDuplicateNickname')
    async checkDuplicateNickname(@Req() req: Request, @Res() res: Response) {
        const { nickname } = req.query;

        try {
            const data = await this.accountService.checkDuplicateNickname(nickname as string);
            console.log(
                '🚀 ~ file: account.controller.ts ~ line 22 ~ AccountController ~ checkDuplicateNickname ~ data',
                data,
            );
            resExecutor(res, this.success, data);
        } catch (err) {
            if (err instanceof AikoError) throw resExecutor(res, err);
        }
    }

    // ! check complete - api doc
    @Get('checkDuplicateEmail')
    async checkDuplicateEmail(@Req() req: Request, @Res() res: Response) {
        const { email } = req.query;

        try {
            const data = await this.accountService.checkDuplicateEmail(email as string);
            resExecutor(res, this.success, data);
        } catch (err) {
            if (err instanceof AikoError) throw resExecutor(res, err);
        }
    }

    // ! check complete - api doc
    @Get('country-list')
    async getCountryList(@Req() req: Request, @Res() res: Response) {
        const { str } = req.query;

        try {
            const data = await this.accountService.getCountryList(str as string);
            console.log('🚀 ~ file: account.controller.ts ~ line 54 ~ AccountController ~ getCountryList ~ data', data);
            resExecutor(res, this.success, data);
        } catch (err) {
            if (err instanceof AikoError) throw resExecutor(res, err);
        }
    }

    // ! check Complete - api doc
    @Post('signup')
    @UseInterceptors(FileInterceptor('file'))
    async signup(@Req() req: Request, @UploadedFile() file: Express.Multer.File, @Res() res: Response) {
        const data = JSON.parse(req.body.obj) as ISignup;
        const imageRoute = file?.filename;

        try {
            await this.accountService.signup(data, imageRoute);
            resExecutor(res, this.success, data);
        } catch (err) {
            if (err instanceof AikoError) throw resExecutor(res, err);
        }
    }

    // ! check complete - api doc
    @Get('login-auth')
    async grantLoginAuth(@Req() req: Request, @Res() res: Response) {
        const { id } = req.query;

        try {
            const data = await this.accountService.grantLoginAuth(id as string);
            resExecutor(res, this.success, data);
        } catch (err) {
            if (err instanceof AikoError) throw resExecutor(res, err);
        }
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
            console.log('🚀 ~ file: account.controller.ts ~ line 98 ~ AccountController ~ login ~ result', result);
            if ('accessToken' in result) {
                res.cookie('ACCESS_TOKEN', result.accessToken);
                res.cookie('REFRESH_TOKEN', result.refreshToken);
                resExecutor(res, this.success, propsRemover(result, 'accessToken', 'refreshToken'));
            } else {
            }
        } catch (err) {
            console.error(err);
            if (err instanceof AikoError) throw resExecutor(res, err);
        }
    }

    // ! check complete - doc api
    @Get('logout')
    logout(@Req() req: Request, @Res() res: Response) {
        res.cookie('ACCESS_TOKEN', null);
        res.cookie('REFRESH_TOKEN', null);
        resExecutor(res, this.success, true);
    }

    // ! check complete - api doc
    @Post('findNickname')
    async findNickname(@Req() req: Request, @Res() res: Response) {
        const { email } = req.body;

        try {
            const data = await this.accountService.findNickname(email);
            resExecutor(res, this.success, data);
        } catch (err) {
            if (err instanceof AikoError) throw resExecutor(res, err);
        }
    }

    // ! check complete - api doc
    @Post('requesting-reset-password')
    async requestResetPassword(@Req() req: Request, @Res() res: Response) {
        const { email } = req.body;

        try {
            const data = await this.accountService.requestResetPassword(email);
            resExecutor(res, this.success, data);
        } catch (err) {
            if (err instanceof AikoError) throw resExecutor(res, err);
        }
    }

    // ! check complete - api doc
    @Post('reset-password')
    async resetPassword(@Req() req: Request, @Res() res: Response) {
        const { uuid, password }: IResetPw = req.body;

        try {
            const data = await this.accountService.resetPassword(uuid, password);
            resExecutor(res, this.success, data);
        } catch (err) {
            if (err instanceof AikoError) throw resExecutor(res, err);
        }
    }

    // ! api doc
    @Post('user-info')
    @UseGuards(UserGuard)
    async getUserInfo(@Req() req: Request, @Res() res: Response) {
        const { USER_PK, COMPANY_PK }: { USER_PK: number; COMPANY_PK: number } = req.body.userPayload;
        const { targetUserId } = req.body;

        try {
            const data = await this.accountService.getUserInfo(targetUserId, COMPANY_PK);
            resExecutor(res, this.success, data);
        } catch (err) {
            if (err instanceof AikoError) throw resExecutor(res, err);
        }
    }

    // 어세스 토큰 재발급

    @Post('access-token')
    async getAccessToken(@Req() req: Request, @Res() res: Response) {
        const { REFRESH_TOKEN }: { REFRESH_TOKEN: string } = req.cookies;
        const result = await this.accountService.getAccessToken(REFRESH_TOKEN);

        try {
            if (result.header) {
                res.cookie('ACCESS_TOKEN', result.accessToken);
                res.cookie('REFRESH_TOKEN', result.refreshToken);
                resExecutor(res, this.success, true);
            } else {
                throw new AikoError('unknown error', 500, 500008);
            }
        } catch (err) {
            throw resExecutor(res, err);
        }
    }
}
