import { secretKeys, expireTime } from './jwtEnums';
import { ISecretKey } from './jwtInterface';
import { Algorithm } from 'jsonwebtoken';

const algorithm: Algorithm = 'HS256';

const loginSecretKey: ISecretKey = {
    secretKey: secretKeys.LOGIN,
    options: {
        algorithm: algorithm,
        expiresIn: Math.floor(Date.now() / 1000) + expireTime.THREE_HOUR,
        issuer: 'Aiko',
    },
    decodeOpt: {
        complete: true,
        json: true,
    },
};

export { loginSecretKey };
