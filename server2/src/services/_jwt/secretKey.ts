import secretKeys from './secretKeyEnum';
import { ISecretKey } from './jwtInterfaces';
import { Algorithm } from 'jsonwebtoken';

const algorithm: Algorithm = 'HS256';

const loginSecretKey: ISecretKey = {
    secretKey: secretKeys.LOGIN,
    options: {
        algorithm: algorithm,
        expiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
        issuer: 'Aiko',
    },
    decodeOpt: {
        complete: true,
        json: true,
    },
};

export { loginSecretKey };
