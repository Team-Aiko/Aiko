import secretKeys from './secretKeyEnum';
import {SignOptions} from 'jsonwebtoken';
import {Algorithm} from 'jsonwebtoken';

interface ISecretKey {
    secretKey: string;
    options: SignOptions;
}

const algorithm: Algorithm = 'HS256';

const loginSecretKey: ISecretKey = {
    secretKey: secretKeys.LOGIN,
    options: {
        algorithm: algorithm,
        expiresIn: Math.floor(Date.now() / 1000) + 60 * 30, // 30 min
        issuer: 'Aiko',
    },
};

export {loginSecretKey};
