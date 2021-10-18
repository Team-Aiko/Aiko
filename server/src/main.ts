import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
// import RedisAdapter from 'src/adapters/redis.adapter';
import { AppModule } from './app.module';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // * CORS
    app.enableCors();

    // * Cookie global middleware
    app.use(cookieParser());

    // * RedisAdapter
    // app.useWebSocketAdapter(new RedisAdapter(app));

    // * port setting
    await app.listen(5000);
}
bootstrap();