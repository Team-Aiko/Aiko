import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import * as config from 'config';
import { AccountModule, FileModule, CompanyModule, MeetingModule, NoticeBoardModule, SocketModule } from './modules';
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
    OTOChatRoom,
    Refresh,
    NoticeBoard,
    Action,
    ActionPriority,
    StepIndex,
    CalledMembers,
    Meet,
    MeetRoom,
} from './entity';
import OneToOneMessageGateway from './gateway/message.gateway';
import { RDBMSConfig } from './interfaces';
import WorkModule from './modules/work.module';

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
        OTOChatRoom,
        Refresh,
        NoticeBoard,
    ],
    //User, LoginAuth, Company, Country, Department, ResetPw, Socket, ChatFile
};
const ORMModule = TypeOrmModule.forRoot(typeORMConfig);

@Module({
    imports: [
        AccountModule,
        CompanyModule,
        ORMModule,
        SocketModule,
        FileModule,
        NoticeBoardModule,
        WorkModule,
        MeetingModule,
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
