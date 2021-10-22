import { Response } from 'express';
import { IHttpError, IResponseData } from '.';

export type IGetResPacket = <T>(
    res: Response,
    description: string,
    httpCode: number,
    appCode: number,
    result?: T,
) => void;
