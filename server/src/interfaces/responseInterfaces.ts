export interface IHttpError {
    statusCode: number;
    description: string;
}

export interface IResponseData<T> extends IHttpError {
    data: T;
}
