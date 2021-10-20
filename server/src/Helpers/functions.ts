import { IHttpError, IResponseData, IGetResPacket } from 'src/interfaces';
import { UserInfo } from 'src/interfaces';
import { ObjectType, getConnection } from 'typeorm';

export const getResPacket: IGetResPacket = function <T>(
    description: string,
    httpCode: number,
    appCode: number,
    result?: T,
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
            result: result,
        };

        return packet;
    }
};

export function getRepo<T>(customRepo: ObjectType<T>) {
    const connection = getConnection();
    return connection.getCustomRepository(customRepo);
}
