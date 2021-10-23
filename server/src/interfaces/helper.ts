import { Response } from 'express';
import { AikoError } from 'src/Helpers/classes';
import { IHttpError, IResponseData } from '.';

export type IGetResPacket = <T>(res: Response, aikoError: AikoError, result?: T) => void;
