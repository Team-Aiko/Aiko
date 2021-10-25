import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { accessTokenBluePrint, refreshTokenBluePrint } from '../interfaces/jwt/secretKey';

@Injectable()
export default class VerifyJwt implements NestMiddleware<Request, Response> {
    async use(req: Request, res: Response, next: NextFunction) {
        try {
            const { TOKEN } = req.cookies;
            jwt.verify(TOKEN, accessTokenBluePrint.secretKey, (err: VerifyErrors | null) => {
                if (err) throw err;
                else next();
            });
        } catch (err) {
            const error = err as VerifyErrors;

            if (error.name === 'TokenExpiredError') {
                return res.status(419).json({
                    code: 419,
                    message: 'TokenExpiredError',
                });
            }

            return res.status(401).json({
                code: 401,
                message: 'Not valid token',
            });
        }

        throw new Error('Method not implemented.');
    }
}
