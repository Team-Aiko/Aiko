import { Controller, Get, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Express, Response } from 'express';
import { ISignup, IResetPw } from '../interfaces/MVC/accountMVC';
import AccountService from '../services/account.service';
import { UserGuard } from 'src/guard/user.guard';
import { usrPayloadParser, AikoError, resExecutor, propsRemover, getRepo, unknownError } from 'src/Helpers';
import { UserRepository } from 'src/mapper';
import { filePath } from 'src/interfaces/MVC/fileMVC';
import MeetingService from 'src/services/meeting.service';

@Controller('account')
export default class AccountController {
    // private accountService: AccountService;

    constructor(private accountService: AccountService, private meetingService: MeetingService) {}

    // ! check complete - api doc
    @Get('checkDuplicateNickname')
    async checkDuplicateNickname(@Req() req: Request, @Res() res: Response) {
        const { nickname } = req.query;

        try {
            const result = await this.accountService.checkDuplicateNickname(nickname as string);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! check complete - api doc
    @Get('checkDuplicateEmail')
    async checkDuplicateEmail(@Req() req: Request, @Res() res: Response) {
        const { email } = req.query;

        try {
            const result = await this.accountService.checkDuplicateEmail(email as string);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! check complete - api doc
    @Get('country-list')
    async getCountryList(@Req() req: Request, @Res() res: Response) {
        const { str } = req.query;

        try {
            const result = await this.accountService.getCountryList(str as string);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! check Complete - api doc
    @Post('signup')
    @UseInterceptors(FileInterceptor('file', { dest: filePath.PROFILE }))
    async signup(@Req() req: Request, @UploadedFile() file: Express.Multer.File, @Res() res: Response) {
        const data = JSON.parse(req.body.obj) as ISignup;

        try {
            let originalname: string;
            let filename: string;

            if (file) {
                originalname = file.originalname;
                filename = file.filename;
            }

            const result = await this.accountService.signup(data, { ORIGINAL_NAME: originalname, FILE_NAME: filename });
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! check complete - api doc
    @Get('login-auth')
    async grantLoginAuth(@Req() req: Request, @Res() res: Response) {
        const { id } = req.query;

        try {
            const result = await this.accountService.grantLoginAuth(id as string);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
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
            let result = await this.accountService.login(data);
            if ('accessToken' in result) {
                res.cookie('ACCESS_TOKEN', result.accessToken, { httpOnly: true });
                res.cookie('REFRESH_TOKEN', result.refreshToken, { httpOnly: true });
                result = propsRemover(result, 'accessToken', 'refreshToken');
                resExecutor(res, { result });
            } else {
            }
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! check complete - doc api
    @Get('logout')
    logout(@Req() req: Request, @Res() res: Response) {
        res.cookie('ACCESS_TOKEN', null);
        res.cookie('REFRESH_TOKEN', null);
        resExecutor(res, { result: true });
    }

    // ! check complete - api doc
    @Post('findNickname')
    async findNickname(@Req() req: Request, @Res() res: Response) {
        const { email } = req.body;

        try {
            const result = await this.accountService.findNickname(email);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! check complete - api doc
    @Post('requesting-reset-password')
    async requestResetPassword(@Req() req: Request, @Res() res: Response) {
        const { email } = req.body;

        try {
            const result = await this.accountService.requestResetPassword(email);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! check complete - api doc
    @Post('reset-password')
    async resetPassword(@Req() req: Request, @Res() res: Response) {
        const { uuid, password }: IResetPw = req.body;

        try {
            const result = await this.accountService.resetPassword(uuid, password);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    @Post('user-info')
    @UseGuards(UserGuard)
    async getUserInfo(@Req() req: Request, @Res() res: Response) {
        const { nickname } = req.body;
        const { COMPANY_PK } = usrPayloadParser(req);

        try {
            const result = await this.accountService.getUserInfo(nickname, COMPANY_PK);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // 어세스 토큰 재발급

    @Post('access-token')
    async getAccessToken(@Req() req: Request, @Res() res: Response) {
        const { REFRESH_TOKEN }: { REFRESH_TOKEN: string } = req.cookies;

        try {
            const result = await this.accountService.getAccessToken(REFRESH_TOKEN);

            if (result.header) {
                res.cookie('ACCESS_TOKEN', result.accessToken);
                res.cookie('REFRESH_TOKEN', result.refreshToken);
                resExecutor(res, { result: true });
            } else {
                throw new AikoError('unknown error', 500, 500008);
            }
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    @UseGuards(UserGuard)
    @Get('decoding-token')
    async decodeToken(@Req() req: Request, @Res() res: Response) {
        const { USER_PK } = usrPayloadParser(req);

        try {
            resExecutor(res, {
                result: propsRemover(await getRepo(UserRepository).getUserInfoWithUserPK(USER_PK), 'iat', 'exp', 'iss'),
            });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    @UseGuards(UserGuard)
    @Get('raw-token')
    async getRawToken(@Req() req: Request, @Res() res: Response) {
        try {
            resExecutor(res, { result: req.cookies.ACCESS_TOKEN });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }
}
