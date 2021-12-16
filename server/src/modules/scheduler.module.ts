import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import SchedulerService from 'src/services/scheduler.service';
import { SocketModule } from '.';
import DriveModule from './driver.module';

@Module({
    imports: [ScheduleModule.forRoot(), SocketModule, DriveModule],
    providers: [SchedulerService],
    exports: [SchedulerService],
})
export default class SchedulerModule {}
