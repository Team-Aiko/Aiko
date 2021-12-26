import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import {
    AccountModule,
    FileModule,
    CompanyModule,
    MeetingModule,
    NoticeBoardModule,
    SocketModule,
    ApprovalModule,
} from './modules';
import { MongooseModule } from '@nestjs/mongoose';

import WorkModule from './modules/work.module';
import TestModule from './modules/test.module';
// import  from './entity/groupChatUL.entity';
import { RouterModule } from '@nestjs/core';
import DriverModule from './modules/driver.module';
import ChatModule from './modules/chat.module';
import SchedulerModule from './modules/scheduler.module';

const MongoDBModule = MongooseModule.forRoot('mongodb://127.0.0.1:27017/nest');

@Module({
    imports: [
        ChatModule,
        SchedulerModule,
        AccountModule,
        CompanyModule,
        TypeOrmModule.forRoot(),
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
}
