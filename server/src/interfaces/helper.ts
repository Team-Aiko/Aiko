import { IHttpError, IResponseData } from '.';

export type IGetResPacket = <T>(
    description: string,
    httpCode: number,
    appCode: number,
    result?: T,
) => IHttpError | IResponseData<T>;
