import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import AccountModule from './modules/account.module';
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

// orm
const read = fs.readFileSync(path.join(__dirname, 'database', 'database.json'), 'utf8');
const parsed = JSON.parse(read);
console.log('parsed = ', parsed);
const config: TypeOrmModuleOptions = {
    type: parsed.type,
    host: parsed.host,
    port: parsed.port,
    username: parsed.username,
    password: parsed.password,
    database: parsed.database,
    entities: [
        UserRepository,
        LoginAuthRepository,
        CompanyRepository,
        CountryRepository,
        DepartmentRepository,
        ResetPwRepository,
    ],
    synchronize: parsed.synchronize,
};
const ormModule = TypeOrmModule.forRoot(config);

@Module({
    imports: [AccountModule, ormModule],
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
