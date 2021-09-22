import { UserTable } from '../../database/tablesInterface';
import express, { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { loginSecretKey } from '../_jwt/secretKey';
import secretKeys from '../_jwt/secretKeyEnum';

// * interfaces
interface IVerifyToken {
    (req: Request, res: Response, next: NextFunction): void;
}

const verifyToken: IVerifyToken = (req, res, next) => {
    try {
        const { TOKEN } = req.cookies;
        jwt.verify(TOKEN, loginSecretKey.secretKey, (err: VerifyErrors | null) => {
            if (err) throw err;
            else next();
        });
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
};

export default verifyToken;
