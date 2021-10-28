import { Module } from '@nestjs/common';
import MeetingController from 'src/controllers/meeting.controller';
import MeetingService from 'src/services/meeting.service';

@Module({
    controllers: [MeetingController],
    providers: [MeetingService],
    exports: [MeetingService],
})
export default class MeetingModule {}
