import { IResponseData, IGetResPacket, IMailBotConfig, IMailConfig } from 'src/interfaces';
import { ObjectType, getConnection } from 'typeorm';
import { HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AikoError, LinkedList } from './classes';
import { Grant, User } from 'src/entity';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';
import * as fs from 'fs';
import { success, unknownError } from '.';
import { typeMismatchError } from './instance';
import * as jwt from 'jsonwebtoken';
import { accessTokenBluePrint, refreshTokenBluePrint } from 'src/interfaces/jwt/secretKey';
import { IErrorPacket } from 'src/interfaces/MVC/socketMVC';
// * pbdkf2-password
import pbkdf2 from 'pbkdf2-pw';

// * config
import * as config from 'config';

// * mailer
import * as nodemailer from 'nodemailer';
import { SendMailOptions } from 'nodemailer';
import * as smtpPool from 'nodemailer-smtp-pool';
const emailConfig = config.get<IMailConfig>('MAIL_CONFIG');
const botEmailAddress = config.get<IMailBotConfig>('MAIL_BOT').botEmailAddress;
const smtpTransporter = nodemailer.createTransport(smtpPool(emailConfig));

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

export function tokenParser(accessToken: string) {
    try {
        return jwt.verify(accessToken, accessTokenBluePrint.secretKey) as IUserPayload;
    } catch (err) {
        console.error(err);
        throw new AikoError('invalid access token', 0, 190241);
    }
}

export function getSocketErrorPacket<T>(path: string, err: Error, originalData: T) {
    const errorPacket: IErrorPacket<T> = {
        path,
        err,
        originalData,
    };

    return errorPacket;
}

export function getRepo<T>(customRepo: ObjectType<T>) {
    const connection = getConnection();
    return connection.getCustomRepository(customRepo);
}

export function propsRemover<T>(obj: T, ...props: string[]) {
    const replica = { ...obj };
    props.forEach((prop) => delete (replica as any)[prop]);

    return replica;
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

export function getUnixTime(date: Date) {
    return Math.floor(date.getTime() / 1000);
}

export function getServerTime(serverHour: number) {
    const today = new Date();
    const hour = serverHour < 10 ? `0${serverHour}` : serverHour.toString();

    const serverTime = Math.floor(
        new Date(`${today.getFullYear()}-${today.getMonth()}-${today.getDate()} ${hour}:00:00`).getTime() / 1000,
    );

    return serverTime;
}

export async function generatePwAndSalt(password: string) {
    const hasher = pbkdf2();

    const [hash, salt] = await new Promise<string[]>((resolve, reject) => {
        hasher({ password }, (err, pw, salt, hash) => {
            if (err) throw err;

            resolve([hash, salt]);
        });
    });

    return { hash, salt };
}

export async function checkPw(password: string, salt: string, serverHash: string) {
    const hasher = pbkdf2();

    return await new Promise<boolean>((resolve, reject) => {
        hasher({ password, salt }, (err, pw, salt, hash) => resolve(serverHash === hash));
    });
}

export function generateLoginToken(userInfo: User) {
    let temporaryUserInfo = propsRemover(
        userInfo,
        'SALT',
        'PASSWORD',
        'LAST_NAME',
        'FIRST_NAME',
        'EMAIL',
        'TEL',
        'IS_DELETED',
        'IS_VERIFIED',
        'COUNTRY_PK',
        'PROFILE_FILE_NAME',
        'company',
        'department',
        'country',
        'resetPws',
        'socket',
        'socket1',
        'socket2',
        'calledMembers',
        'profile',
    );
    temporaryUserInfo = { ...temporaryUserInfo };
    const userPk = temporaryUserInfo.USER_PK;
    const tokens = {
        access: jwt.sign(temporaryUserInfo, accessTokenBluePrint.secretKey, accessTokenBluePrint.options),
        refresh: jwt.sign({ userPk: userPk }, refreshTokenBluePrint.secretKey, refreshTokenBluePrint.options),
    };
    return tokens;
}

export function checkRefreshToken(refreshToken: string) {
    return jwt.verify(refreshToken, refreshTokenBluePrint.secretKey)['userPk'] as number;
}

// send mail function
export async function sendMail(mailOpt: Pick<SendMailOptions, 'text' | 'subject' | 'to'>) {
    return await new Promise<boolean>((resolve, reject) => {
        smtpTransporter.sendMail({ ...mailOpt, from: botEmailAddress }, (err, info) => {
            if (err) {
                console.error(err);
                resolve(false);
            }

            resolve(true);
        });
    });
}

export function parseCookieString<T extends { [idx: string]: string }>(cookie: string) {
    const temp = cookie.split(';');
    const cookieJson: { [idx: string]: string } = {};

    temp.forEach((str) => {
        const arr = str.split('=');
        const key = arr[0].trim();
        const value = arr[1].trim();
        cookieJson[key] = value;
    });

    return cookieJson as T;
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
