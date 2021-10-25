import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import * as config from 'config';
import AccountModule from './modules/account.module';
import FileModule from './modules/file.module';
import VerifyJwt from './middlewares/verifyJwt';
import DecodeJwt from './middlewares/decodeJwt';
<<<<<<< HEAD
import { LoginAuth, User, Company, Country, Department, ResetPw, Socket, ChatFile, OTOChatRoom, Refresh, NoticeBoard } from './entity';
=======
import {
    Grant,
    AuthListTable,
    LoginAuth,
    User,
    Company,
    Country,
    Department,
    ResetPw,
    Socket,
    ChatFile,
    OTOChatRoom,
    Refresh,
} from './entity';
>>>>>>> 66cdd098de720b1450aeb1bf20d143cfc187a843
import OneToOneMessageGateway from './gateway/message.gateway';
import { RDBMSConfig } from './interfaces';
import CompanyModule from './modules/company.module';
import SocketModule from './modules/socket.module';
import NoticeBoardModule from './modules/noticeBoard.module';

// orm
console.log(__dirname + '/entity/*.entity.(js,ts)');
const typeORMConfig: TypeOrmModuleOptions = {
    ...config.get<RDBMSConfig>('RDBMS'),
<<<<<<< HEAD
    entities: [User, LoginAuth, Company, Country, Department, ResetPw, Socket, ChatFile, OTOChatRoom, Refresh, NoticeBoard],
=======
    entities: [
        Grant,
        AuthListTable,
        User,
        LoginAuth,
        Company,
        Country,
        Department,
        ResetPw,
        Socket,
        ChatFile,
        OTOChatRoom,
        Refresh,
    ],
>>>>>>> 66cdd098de720b1450aeb1bf20d143cfc187a843
    //User, LoginAuth, Company, Country, Department, ResetPw, Socket, ChatFile
};
const ORMModule = TypeOrmModule.forRoot(typeORMConfig);

@Module({
    imports: [AccountModule, CompanyModule, ORMModule, SocketModule, FileModule, NoticeBoardModule],
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
