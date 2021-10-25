import { secretKeys, expireTime } from './jwtEnums';
import { ITokenBluePrint } from './jwtInterface';
import { Algorithm } from 'jsonwebtoken';

const algorithm: Algorithm = 'HS256';

const accessTokenBluePrint: ITokenBluePrint = {
    secretKey: secretKeys.ACCESS_TOKEN,
    options: {
        algorithm: algorithm,
        expiresIn: Math.floor(Date.now() / 1000) + expireTime.ACCESS_TOKEN_LIFE,
        issuer: 'Aiko',
    },
    decodeOpt: {
        complete: true,
        json: true,
    },
};

const refreshTokenBluePrint: ITokenBluePrint = {
    secretKey: secretKeys.REFRESH_TOKEN,
    options: {
        algorithm: algorithm,
        expiresIn: Math.floor(Date.now() / 1000) + expireTime.REFRESH_TOKEN_LIFE,
        issuer: 'Aiko',
    },
    decodeOpt: {
        complete: true,
        json: true,
    },
};

export { accessTokenBluePrint, refreshTokenBluePrint };
