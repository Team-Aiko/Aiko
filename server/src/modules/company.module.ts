import { Module } from '@nestjs/common';
import CompanyController from 'src/controllers/company.controller';
import AccountService from 'src/services/account.service';
import CompanyService from 'src/services/company.service';
import MeetingService from 'src/services/meeting.service';
import SocketService from 'src/services/socket.service';
import WorkService from 'src/services/work.service';

@Module({
    controllers: [CompanyController],
    providers: [CompanyService, AccountService, MeetingService, SocketService, WorkService],
    exports: [CompanyService],
})
export default class CompanyModule {}
