import secretKeys from './secretKeyEnum';
import { SignOptions, DecodeOptions } from 'jsonwebtoken';
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
};

const decodeOpt: DecodeOptions = {
    complete: true,
    json: true,
};

export { loginSecretKey, decodeOpt };
