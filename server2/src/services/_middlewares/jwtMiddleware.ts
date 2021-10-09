import jwt, { VerifyErrors } from 'jsonwebtoken';
import { loginSecretKey } from '../_jwt/secretKey';
import { IDecodeToken, IVerifyToken } from '../_jwt/jwtInterfaces';

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

const decodeToken: IDecodeToken = (req, res, next) => {
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
};

export { verifyToken, decodeToken };
