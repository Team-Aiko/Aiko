import { SignOptions, DecodeOptions } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface ISecretKey {
    secretKey: string;
    options: SignOptions;
    decodeOpt: DecodeOptions;
}

export interface IVerifyToken {
    (req: Request, res: Response, next: NextFunction): void;
}
export interface IDecodeToken {
    (req: Request, res: Response, next: NextFunction): void;
}
