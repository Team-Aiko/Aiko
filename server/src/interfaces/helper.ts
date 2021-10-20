import { IHttpError, IResponseData } from '.';

export type IGetResPacket = <T>(
    description: string,
    httpCode: number,
    appCode: number,
    data?: T,
) => IHttpError | IResponseData<T>;
