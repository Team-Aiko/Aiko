import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import * as config from 'config';
import AccountModule from './modules/account.module';
import FileModule from './modules/file.module';
import ChatModule from './modules/chat.module';
import VerifyJwt from './middlewares/verifyJwt';
import DecodeJwt from './middlewares/decodeJwt';
import { LoginAuth, User, Company, Country, Department, ResetPw, Socket, ChatFile, OTOChatRoom } from './entity';
import OneToOneMessageGateway from './gateway/message.gateway';
import { RDBMSConfig } from './interfaces';
import CompanyModule from './modules/company.module';
import SocketModule from './modules/socket.module';

// orm
console.log(__dirname + '/entity/*.entity.(js,ts)');
const typeORMConfig: TypeOrmModuleOptions = {
    ...config.get<RDBMSConfig>('RDBMS'),
    entities: [User, LoginAuth, Company, Country, Department, ResetPw, Socket, ChatFile, OTOChatRoom],
    //User, LoginAuth, Company, Country, Department, ResetPw, Socket, ChatFile
};
const ORMModule = TypeOrmModule.forRoot(typeORMConfig);

@Module({
    providers: [OneToOneMessageGateway],
})
export class AppModule {
    constructor(private connection: Connection) {
        // database connection : connection
    }
    //middleware
    // configure(consumer: MiddlewareConsumer) {
    //     consumer.apply(VerifyJwt).forRoutes({
    //         path: 'company/organization-chart',
    //         method: RequestMethod.ALL,
    //     });
    // }
}
