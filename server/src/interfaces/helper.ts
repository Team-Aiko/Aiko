import { HttpException } from '@nestjs/common';
import { Response } from 'express';
import { AikoError } from 'src/Helpers/classes';
import { IHttpError, IResponseData } from '.';

export type IGetResPacket = (res: Response, pack?: { result?: any; err?: AikoError | Error }) => HttpException | void;
