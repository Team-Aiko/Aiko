import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // * Cookie global middleware
    app.use(cookieParser());

    // * port setting
    await app.listen(5000);
}
bootstrap();
