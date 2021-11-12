import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import AccountController from 'src/controllers/account.controller';
import AccountService from '../services/account.service';
import SocketService from 'src/services/socket.service';
import { filePath } from 'src/interfaces/MVC/fileMVC';
import MeetingService from 'src/services/meeting.service';
import WorkService from 'src/services/work.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PriavateChatlog, PrivateChatlogSchema } from 'src/schemas/chatlog.schema';
import { Status, StatusSchema } from 'src/schemas/status.schema';

@Module({
    imports: [
        // file upload multer module
        MulterModule.register({
            dest: filePath.PROFILE,
        }),
        // mongodb imports
        MongooseModule.forFeature([
            { name: PriavateChatlog.name, schema: PrivateChatlogSchema },
            { name: Status.name, schema: StatusSchema },
        ]),
    ],
    controllers: [AccountController],
    providers: [AccountService, SocketService, MeetingService, WorkService],
    exports: [AccountService],
})
export default class AccountModule {}
