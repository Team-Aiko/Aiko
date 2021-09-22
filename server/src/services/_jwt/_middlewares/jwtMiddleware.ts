import randToken from 'rand-token';
import jwt, {VerifyErrors, TokenExpiredError, JsonWebTokenError} from 'jsonwebtoken';
import {UserTable} from '../../../database/tablesInterface';
import {Request, Response, NextFunction} from 'express';
import {loginSecretKey} from '../_config/secretKey';

const TOKEN_EXPIRE = -3;
const TOKEN_INVALID = -2;

interface IVerifyToken {
    (req: Request, res: Response, next: NextFunction): void;
}

const verifyToken: IVerifyToken = async (req, res, next) => {
    try {
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
    } finally {
    }
};
