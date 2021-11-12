import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import CompanyController from 'src/controllers/company.controller';
import { PriavateChatlog, PrivateChatlogSchema } from 'src/schemas/chatlog.schema';
import { Status, StatusSchema } from 'src/schemas/status.schema';
import AccountService from 'src/services/account.service';
import CompanyService from 'src/services/company.service';
import MeetingService from 'src/services/meeting.service';
import SocketService from 'src/services/socket.service';
import WorkService from 'src/services/work.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: PriavateChatlog.name, schema: PrivateChatlogSchema },
            { name: Status.name, schema: StatusSchema },
        ]),
    ],
    controllers: [CompanyController],
    providers: [CompanyService, AccountService, MeetingService, SocketService, WorkService],
    exports: [CompanyService],
})
export default class CompanyModule {}
