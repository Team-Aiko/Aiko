import { SignOptions } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface ISecretKey {
    secretKey: string;
    options: SignOptions;
}

export interface IVerifyToken {
    (req: Request, res: Response, next: NextFunction): void;
}
export interface IDecodeToken {
    (req: Request, res: Response, next: NextFunction): void;
}
