import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import SchedulerService from 'src/services/scheduler.service';
import { SocketModule } from '.';

@Module({
    imports: [ScheduleModule.forRoot(), SocketModule],
    providers: [SchedulerService],
    exports: [SchedulerService],
})
export default class SchedulerModule {}
