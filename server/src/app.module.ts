import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import * as config from 'config';
import {
    AccountModule,
    FileModule,
    CompanyModule,
    MeetingModule,
    NoticeBoardModule,
    SocketModule,
    ApprovalModule,
} from './modules';
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
    ChatLogStorage,
    GroupChatStorage,
} from './entity';
import { MongooseModule } from '@nestjs/mongoose';
import { RDBMSConfig } from './interfaces';
import WorkModule from './modules/work.module';
import TestModule from './modules/test.module';
import GroupChatUserList from './entity/groupChatUL.entity';
import ApprovalFrame from './entity/approvalFrame';
import ApprovalStep from './entity/approvalStep';
import { RouterModule } from '@nestjs/core';
import DriverModule from './modules/driver.module';
import ChatModule from './modules/chat.module';
import SchedulerModule from './modules/scheduler.module';

// orm
console.log(__dirname + '/entity/*.entity.(js,ts)');
const typeORMConfig: TypeOrmModuleOptions = {
    ...config.get<RDBMSConfig>('RDBMS'),
    entities: [
        GroupChatStorage,
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
        ChatFile,
        PrivateChatRoom,
        Refresh,
        NoticeBoard,
        NoticeBoardFile,
        ApprovalFrame,
        ApprovalStep,
    ],
    //User, LoginAuth, Company, Country, Department, ResetPw, Socket, ChatFile
};
const ORMModule = TypeOrmModule.forRoot(typeORMConfig);
const MongoDBModule = MongooseModule.forRoot('mongodb://localhost/nest');

@Module({
    imports: [
        ChatLogStorage,
        ChatModule,
        SchedulerModule,
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
