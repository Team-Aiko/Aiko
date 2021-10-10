import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { ParsedQs } from 'qs';
import { loginSecretKey } from 'src/interfaces/jwt/secretKey';

export default class DecodeJwt implements NestMiddleware<Request, Response> {
    use(req: Request, res: Response, next: NextFunction) {
        try {
            const { TOKEN } = req.cookies;
            const decode = jwt.decode(TOKEN, loginSecretKey.decodeOpt) as jwt.JwtPayload;
            req.body.jwtPayload = decode.payload;
            next();
        } catch (e) {
            const error = e as VerifyErrors;

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
    }
}
