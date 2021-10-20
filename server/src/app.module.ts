import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import * as config from 'config';
import AccountModule from './modules/account.module';
import FileModule from './modules/file.module';
import ChatModule from './modules/chat.module';
import VerifyJwt from './middlewares/verifyJwt';
import DecodeJwt from './middlewares/decodeJwt';
import { LoginAuth, User, Company, Country, Department, ResetPw, Socket, ChatFile } from './entity';
import OneToOneMessageGateway from './gateway/message.gateway';
import { RDBMSConfig } from './interfaces';

// orm
const typeORMConfig: TypeOrmModuleOptions = {
    ...config.get<RDBMSConfig>('RDBMS'),
    entities: [User, LoginAuth, Company, Country, Department, ResetPw, Socket, ChatFile],
};
const ORMModule = TypeOrmModule.forRoot(typeORMConfig);

@Module({
    imports: [AccountModule, ORMModule, ChatModule, FileModule],
    providers: [OneToOneMessageGateway],
})
export class AppModule implements NestModule {
    constructor(private connection: Connection) {
        // database connection : connection
    }

    // middlewares
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(VerifyJwt).forRoutes({
            path: 'company',
            method: RequestMethod.ALL,
        });
        consumer.apply(DecodeJwt).forRoutes('company');
    }
}
