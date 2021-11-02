import { HttpException } from '@nestjs/common';
import { Response } from 'express';
import { AikoError } from 'src/Helpers/classes';
import { IHttpError, IResponseData } from '.';

export type IGetResPacket = <T>(
    { res, result }: { res: Response; result?: T },
    error?: AikoError | Error,
) => HttpException | undefined;
