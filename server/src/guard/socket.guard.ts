import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { accessTokenBluePrint } from '../interfaces/jwt/secretKey';
import { Socket } from 'socket.io';
import { AikoError, parseCookieString } from 'src/Helpers';
import { tokenParser } from 'src/Helpers/functions';

@Injectable()
export class SocketGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const socket = context.switchToHttp().getRequest() as Socket;

        try {
            const { cookie } = socket.client.request.headers;
            const { ACCESS_TOKEN } = parseCookieString<{ ACCESS_TOKEN: string; REFRESH_TOKEN: string }>(cookie);
            const userPayload = tokenParser(ACCESS_TOKEN);
            socket.client.request.headers['user-payload'] = JSON.stringify(userPayload);
        } catch (err) {
            console.error(err);
            throw new AikoError('SocketGuard/invalid token error', 100, 8928192);
        }

        return true;
    }
}
