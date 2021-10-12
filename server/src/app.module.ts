import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Connection } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as Joi from 'joi';
import * as config from 'config';
import AccountModule from './modules/account.module';
import ChatModule from './modules/chat.module';
import VerifyJwt from './middlewares/verifyJwt';
import DecodeJwt from './middlewares/decodeJwt';
import {
    LoginAuthRepository,
    UserRepository,
    CompanyRepository,
    CountryRepository,
    DepartmentRepository,
    ResetPwRepository,
} from './entity';
import OneToOneMessageGateway from './gateway/message.gateway';
import { RDBMSConfig } from './interfaces';

// orm
const typeORMConfig: TypeOrmModuleOptions = {
    ...config.get<RDBMSConfig>('RDBMS'),
    entities: [
        UserRepository,
        LoginAuthRepository,
        CompanyRepository,
        CountryRepository,
        DepartmentRepository,
        ResetPwRepository,
    ],
};
const ORMModule = TypeOrmModule.forRoot(typeORMConfig);

@Module({
    imports: [AccountModule, ORMModule, ChatModule],
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
