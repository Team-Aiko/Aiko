import { IHttpError, IResponseData, IGetResPacket } from 'src/interfaces';
import { ObjectType, getConnection } from 'typeorm';
import { HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AikoError } from './classes';
import { Grant } from 'src/entity';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';

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

export function usrPayloadParser(request: Request) {
    const unparsedUserPayload = request.headers.userPayload;
    return JSON.parse(unparsedUserPayload as string) as IUserPayload;
}

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

export function valueChanger<T, O>(changeVal: T, obj: O, propName: string) {
    if (propName in obj) {
        if (
            typeof changeVal === 'boolean' &&
            (typeof obj[propName] === 'number' ||
                typeof obj[propName] === 'undefined' ||
                typeof obj[propName] === 'object') &&
            changeVal !== obj[propName]
        ) {
            obj[propName] = Number(changeVal);
        }

        if (typeof changeVal === typeof obj[propName] && changeVal !== obj[propName]) {
            obj[propName] = changeVal;
        }
    }

    return obj;
}

// 시험용, 쓰지말 것
export function grantPipeline(grants: Grant[], ...cbs: Function[]) {
    try {
        isChiefAdmin(grants);
        return cbs.map((cb) => cb());
    } catch (err) {
        if (err instanceof AikoError) throw err;
    }
}

export function unixTimeStamp(): number {
    return Math.floor(new Date().getTime() / 1000);
}
