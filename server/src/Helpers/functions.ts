import { IHttpError, IResponseData, IGetResPacket } from 'src/interfaces';
import { ObjectType, getConnection } from 'typeorm';
import { HttpException } from '@nestjs/common';
import { Response } from 'express';
import { AikoError } from './classes';
import { Grant } from 'src/entity';

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

export function isChiefAdmin(grants: Grant[]) {
    try {
        const isAdmin = grants?.some((grant) => grant.AUTH_LIST_PK === 1);
        if (!isAdmin) throw new AikoError('NO_AUTHORIZATION', 500, 500321);
        else return isAdmin;
    } catch (err) {
        throw err;
    }
}

export function unixTimeStamp(): number {
    return Math.floor(new Date().getTime() / 1000);
}
