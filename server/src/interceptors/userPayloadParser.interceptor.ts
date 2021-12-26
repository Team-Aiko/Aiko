import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { usrPayloadParser } from 'src/Helpers';

@Injectable()
export default class UserPayloadParserInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest() as Request;
        const res = context.switchToHttp().getResponse() as Response;

        try {
            const userPayload = usrPayloadParser(req);
            req.body['userPayload'] = userPayload;
            return next.handle().pipe();
        } catch (err) {
            return next.handle().pipe();
        }
    }
}
