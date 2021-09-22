import secretKeys from './secretKeyEnum';
import { SignOptions } from 'jsonwebtoken';
import { Algorithm } from 'jsonwebtoken';

interface ISecretKey {
    secretKey: string;
    options: SignOptions;
}

const algorithm: Algorithm = 'HS256';

const loginSecretKey: ISecretKey = {
    secretKey: secretKeys.LOGIN,
    options: {
        algorithm: algorithm,
        expiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
        issuer: 'Aiko',
    },
};

export { loginSecretKey };
