import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import * as config from 'config';
import { AccountModule, FileModule, CompanyModule, MeetingModule, NoticeBoardModule, SocketModule } from './modules';
import VerifyJwt from './middlewares/verifyJwt';
import {
    FolderBin,
    FileBin,
    FileKeys,
    FileHistory,
    FileFolder,
    GroupChatRoom,
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
import GroupChatUserList from './entity/groupChatUserList.entity';
import { RouterModule } from '@nestjs/core';
import DriverModule from './modules/driver.module';

// orm
console.log(__dirname + '/entity/*.entity.(js,ts)');
const typeORMConfig: TypeOrmModuleOptions = {
    ...config.get<RDBMSConfig>('RDBMS'),
    entities: [
        FolderBin,
        FileBin,
        FileKeys,
        FileHistory,
        FileFolder,
        GroupChatUserList,
        GroupChatRoom,
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
        DriverModule,
        // nested routes
        RouterModule.register([
            { path: 'store', module: FileModule, children: [{ path: 'drive', module: DriverModule }] },
        ]),
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
