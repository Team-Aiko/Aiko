import { IHttpError, IResponseData, IGetResPacket } from 'src/interfaces';
import { ObjectType, getConnection } from 'typeorm';
import { HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AikoError, LinkedList } from './classes';
import { Grant } from 'src/entity';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';
import * as fs from 'fs';
import { success, unknownError } from '.';
import { typeMismatchError } from './instance';
import { type } from 'os';

export const resExecutor: IGetResPacket = function (res: Response, pack: { result?: any; err?: AikoError | Error }) {
    const { result, err } = pack;

    const packet: IResponseData<any> = {
        httpCode: err instanceof AikoError ? err.stateCode : result ? success.stateCode : unknownError.stateCode,
        description:
            err instanceof AikoError ? err.description : result ? success.description : unknownError.description,
        appCode: err instanceof AikoError ? err.appCode : result ? success.appCode : unknownError.appCode,
    };

    if (result === undefined || result === null) return new HttpException(packet, packet.httpCode);
    else {
        packet.result = result;

        res.send(packet);
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

export function transformToLinkedList<T>(list: T[]) {
    const linkedList: LinkedList<T> = new LinkedList();
    list.forEach((item) => {
        linkedList.insertRight(item);
    });

    return linkedList;
}

export function bodyChecker<T>(
    body: T,
    sample: {
        [idx: string]:
            | 'undefined'
            | 'number'
            | 'string'
            | 'boolean'
            | 'object'
            | 'number[]'
            | 'string[]'
            | 'boolean[]'
            | 'object[]';
    },
) {
    const keys = Object.keys(body);

    const flag = keys.some((key) => {
        const type1 = typeof body[key];
        const type2 = sample[key];
        let isArr = false;

        // undefined filter
        if (type1 === 'undefined') return true;

        // array filter
        if (type2.slice(-2) === '[]') isArr = Array.isArray(body[key]);
        if (isArr) {
            if (body[key].length > 0 && typeof body[key][0] !== type2.slice(0, -2)) return true;
        } else {
            return type1 !== type2;
        }
    });

    if (flag) throw typeMismatchError;
    return true;
}

export function getExtensionOfFilename(filename: string) {
    const _fileLen = filename.length;
    /**
     * lastIndexOf('.')
     * 뒤에서부터 '.'의 위치를 찾기위한 함수
     * 검색 문자의 위치를 반환한다.
     * 파일 이름에 '.'이 포함되는 경우가 있기 때문에 lastIndexOf() 사용
     */
    const _lastDot = filename.lastIndexOf('.');

    // 확장자 명만 추출한 후 소문자로 변경
    const _fileExt = filename.substring(_lastDot, _fileLen).toLowerCase();

    return _fileExt;
}

// 시험용, 쓰지말 것
// export function grantPipeline(grants: Grant[], ...cbs: Function[]) {
//     try {
//         isChiefAdmin(grants);
//         return cbs.map((cb) => cb());
//     } catch (err) {
//         if (err instanceof AikoError) throw err;
//     }
// }

export function unixTimeStamp(): number {
    return Math.floor(new Date().getTime() / 1000);
}

// 파일삭제
export function deleteFiles(destination: string, ...uuid: string[]) {
    for (const _uuid of uuid) {
        const target = destination + '/' + _uuid;
        fs.unlink(target, (log) => {
            if (log === null) {
                console.log('파일 삭제 성공');
            } else {
                console.log('파일 삭제 실패:' + log);
            }
        });
    }
}
