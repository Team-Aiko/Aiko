import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import requestLogger from 'src/logger/requestLogger';
const geoIP = require('geoip-lite');
@Injectable()
export default class RequestLoggerInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest() as Request;
        const res = context.switchToHttp().getResponse() as Response;
        const { path, ip, method } = req;
        console.log(
            '🚀 ~ file: requestLogger.Interceptor.ts ~ line 12 ~ RequestLoggerInterceptor ~ intercept ~ ip',
            ip.split('::ffff:')[1],
        );

        try {
            const { country, region, city, timezone } = geoIP.lookup(ip);

            requestLogger.info(`
            URL = ${path}
            METHOD = ${method}
            IP = ${ip}
            COUNTRY = ${country}
            REGION = ${region}
            CITY = ${city}
            TIMEZONE = ${timezone}
            `);

            return next.handle().pipe();
        } catch (err) {
            requestLogger.info(`
            URL = ${path}
            METHOD = ${method}
            IP = ${ip}
            *** local_test ***
            `);
            return next.handle().pipe();
        }
    }
}
