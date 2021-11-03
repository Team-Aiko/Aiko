import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { accessTokenBluePrint, refreshTokenBluePrint } from '../interfaces/jwt/secretKey';
import { Request, Response } from 'express';
import { AikoError, resExecutor, unknownError } from 'src/Helpers';
import { expiredTokenError, invalidTokenError } from 'src/Helpers/instance';
@Injectable()
export class UserGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest() as Request;
        const res = context.switchToHttp().getResponse() as Response;

        try {
            const accessToken = request.cookies.ACCESS_TOKEN;
            const payload = jwt.verify(accessToken, accessTokenBluePrint.secretKey); //임시테스트
            request.headers.userPayload = JSON.stringify(payload); //테스트
            // jwt paylo>>>>>>> 9b355d5705db29fce93eb1318bcd3bf76cec9e5b
        } catch (error) {
            const err = error as jwt.VerifyErrors;
            if (err.name === 'TokenExpiredError') {
                // 토큰 유효하지 않을 때
                throw resExecutor(res, { err: expiredTokenError });
                // new HttpException(
                //     {
                //         status: HttpStatus.FORBIDDEN,
                //         dsec: '토큰 만료됨.',
                //         result: '',
                //     },
                //     HttpStatus.FORBIDDEN,
                // );
            } else if (err.name === 'JsonWebTokenError') {
                // 토큰 유효하지 않을 때
                throw resExecutor(res, { err: invalidTokenError });
            } else {
                throw resExecutor(res);
            }
        }
        return true;
    }
}
