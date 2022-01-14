import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import AccountController from 'src/controllers/account.controller';
import AccountService from '../services/account.service';
import { filePath } from 'src/interfaces/MVC/fileMVC';
import MeetingModule from './meeting.module';
import WorkModule from './work.module';
import SocketModule from './socket.module';
import DriveModule from './driver.module';
import CompanyService from 'src/services/company.service';

@Module({
    imports: [
        // file upload multer module
        MulterModule.register({
            dest: filePath.PROFILE,
        }),
        // mongodb imports
        SocketModule,
        MeetingModule,
        WorkModule,
        DriveModule,
    ],
    controllers: [AccountController],
    providers: [CompanyService, AccountService],
    exports: [AccountService],
})
export default class AccountModule {}
