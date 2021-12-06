import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import * as config from 'config';
import { AccountModule,
    FileModule,
    CompanyModule,
    MeetingModule,
    NoticeBoardModule,
    SocketModule,
    ApprovalModule,
} from './modules';
import VerifyJwt from './middlewares/verifyJwt';
import {
    UserProfileFile,
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
    Refresh,
    NoticeBoard,
    Action,
    ActionPriority,
    StepIndex,
    NoticeBoardFile,
    CalledMembers,
    Meet,
    MeetRoom,
    PrivateChatRoom,
} from './entity';
import { MongooseModule } from '@nestjs/mongoose';
import { RDBMSConfig } from './interfaces';
import WorkModule from './modules/work.module';
import TestModule from './modules/test.module';

// orm
console.log(__dirname + '/entity/*.entity.(js,ts)');
const typeORMConfig: TypeOrmModuleOptions = {
    ...config.get<RDBMSConfig>('RDBMS'),
    entities: [
        UserProfileFile,
        CalledMembers,
        Meet,
        MeetRoom,
        Action,
        ActionPriority,
        StepIndex,
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
        PrivateChatRoom,
        Refresh,
        NoticeBoard,
        NoticeBoardFile,
    ],
    //User, LoginAuth, Company, Country, Department, ResetPw, Socket, ChatFile
};
const ORMModule = TypeOrmModule.forRoot(typeORMConfig);
const MongoDBModule = MongooseModule.forRoot('mongodb://localhost/nest');

@Module({
    imports: [
        AccountModule,
        CompanyModule,
        ORMModule,
        MongoDBModule,
        SocketModule,
        FileModule,
        NoticeBoardModule,
        WorkModule,
        MeetingModule,
        TestModule,
        ApprovalModule,
    ],
    providers: [],
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
