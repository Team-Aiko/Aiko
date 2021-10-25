import { IHttpError, IResponseData, IGetResPacket } from 'src/interfaces';
import { ObjectType, getConnection } from 'typeorm';
import { HttpException } from '@nestjs/common';
import { Response } from 'express';
import { AikoError } from './classes';

export const resExecutor: IGetResPacket = function <T>(res: Response, aikoError: AikoError, result?: T) {
    let packet: IHttpError | IResponseData<T>;

    if (result === undefined || result === null) {
        packet = {
            httpCode: aikoError.stateCode,
            description: aikoError.description,
            appCode: aikoError.appCode,
        };

        return new HttpException(packet, aikoError.stateCode);
    } else {
        packet = {
            httpCode: aikoError.stateCode,
            description: aikoError.description,
            appCode: aikoError.appCode,
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
