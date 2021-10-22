import { IHttpError, IResponseData, IGetResPacket } from 'src/interfaces';
import { ObjectType, getConnection } from 'typeorm';
import { HttpException } from '@nestjs/common';
import { Response } from 'express';

export const resExecutor: IGetResPacket = function <T>(
    res: Response,
    description: string,
    httpCode: number,
    appCode: number,
    result?: T,
) {
    let packet: IHttpError | IResponseData<T>;

    if (result === undefined || result === null) {
        packet = {
            httpCode: httpCode,
            description: description,
            appCode: appCode,
        };

        return new HttpException(packet, httpCode);
    } else {
        packet = {
            httpCode: httpCode,
            description: description,
            appCode: appCode,
            result: result,
        };

        res.send(packet);

        return undefined;
    }
};

export function getRepo<T>(customRepo: ObjectType<T>) {
    const connection = getConnection();
    return connection.getCustomRepository(customRepo);
}

export function propsRemover<T>(obj: T, ...props: string[]) {
    props.forEach((prop) => delete (obj as any)[prop]);

    return obj;
}

export function checkNull(input): boolean {
    if (input !== null) {
        return true;
    } else {
        return false;
    }
}
// export function headerCheck(): boolean {
//     return true;
// } 헤더검증
// export function bodyrCheck(): boolean {
//     return true;
// } 바디 검증
