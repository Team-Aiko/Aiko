import { AikoError } from 'src/Helpers';

export interface IHttpError {
    httpCode: number;
    description: string;
}

export interface IResponseData<T> extends IHttpError {
    appCode: number;
    errorStack: AikoError;
    result?: T;
}
