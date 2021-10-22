import { IHttpError, IResponseData, IGetResPacket } from 'src/interfaces';
import { UserInfo } from 'src/interfaces';
import { addAbortSignal } from 'stream';
import { ObjectType, getConnection } from 'typeorm';

export const getResPacket: IGetResPacket = function <T>(
    description: string,
    httpCode: number,
    appCode: number,
    result?: T,
): IHttpError | IResponseData<T> {
    let packet: IHttpError | IResponseData<T>;

    if (!result) {
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
