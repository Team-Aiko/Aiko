import { IHttpError, IResponseData, IGetResPacket } from 'src/interfaces';
import { UserInfo } from 'src/interfaces';

export const getResPacket: IGetResPacket = function <T>(
    description: string,
    httpCode: number,
    appCode: number,
    data?: T,
): IHttpError | IResponseData<T> {
    let packet: IHttpError | IResponseData<T>;

    if (!appCode) {
        packet = {
            httpCode: httpCode,
            description: description,
        };

        return packet;
    } else {
        packet = {
            httpCode: httpCode,
            description: description,
            appCode: appCode,
            data: data,
        };

        return packet;
    }
};
