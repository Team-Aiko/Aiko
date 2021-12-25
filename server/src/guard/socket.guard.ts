import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { accessTokenBluePrint } from '../interfaces/jwt/secretKey';
import { Request } from 'express';
import { AikoError } from 'src/Helpers';

@Injectable()
export class SocketGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest() as Request;

        try {
            const accessToken = request.cookies.ACCESS_TOKEN;
            jwt.verify(accessToken, accessTokenBluePrint.secretKey); //임시테스트
        } catch (err) {
            throw new AikoError('SocketGuard/invalid token error', 100, 8928192);
        }

        return true;
    }
}
