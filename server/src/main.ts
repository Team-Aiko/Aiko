import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
// import RedisAdapter from 'src/adapters/redis.adapter';
import { AppModule } from './app.module';
import RedisIoAdapter from './adapters/redis.adapter';
import { static as staticPath } from 'express';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useWebSocketAdapter(new RedisIoAdapter(app));

    // * CORS
    app.enableCors();

    // * image static root
    app.use('/profile', staticPath(join(__dirname, '..', '..', 'files/profile')));

    // * Cookie global middleware
    app.use(cookieParser());

    // * RedisAdapter
    // app.useWebSocketAdapter(new RedisAdapter(app));

    // * port setting
    await app.listen(5000);
}
bootstrap();
