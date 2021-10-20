export interface IHttpError {
    httpCode: number;
    description: string;
}

export interface IResponseData<T> extends IHttpError {
    appCode: number;
    data: T;
}
