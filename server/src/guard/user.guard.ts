import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { loginSecretKey } from '../interfaces/jwt/secretKey';
@Injectable()
export class UserGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        try {
            const request = context.switchToHttp().getRequest();
            const accessToken = request.headers.cookie.split('ACCESS_TOKEN=')[1];
            const payload = jwt.verify(accessToken, loginSecretKey.secretKey); //임시테스트
            request.body.payload = payload; // jwt payload
        } catch (error) {
            const err = error as jwt.VerifyErrors;
            if (err.name === 'TokenExpiredError') {
                // 토큰 유효하지 않을 때
                throw new HttpException(
                    {
                        status: HttpStatus.FORBIDDEN,
                        dsec: '토큰 만료됨.',
                        result: '',
                    },
                    HttpStatus.FORBIDDEN,
                );
            } else if (err.name === 'JsonWebTokenError') {
                // 토큰 유효하지 않을 때
                throw new HttpException(
                    {
                        status: HttpStatus.UNAUTHORIZED,
                        desc: '토큰 유효성 검사 실패',
                        result: '',
                    },
                    HttpStatus.UNAUTHORIZED,
                );
            } else {
                throw new HttpException(
                    {
                        //토큰 에러 이외 에러 처리 (쿠키 split 파싱 오류 등)
                        status: HttpStatus.FORBIDDEN,
                        desc: error.name,
                        result: '',
                    },
                    HttpStatus.FORBIDDEN,
                );
            }
        }
        return true;
    }
}
