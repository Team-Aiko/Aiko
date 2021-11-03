import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import AccountController from 'src/controllers/account.controller';
import AccountService from '../services/account.service';
import SocketService from 'src/services/socket.service';
import { filePath } from 'src/interfaces/MVC/fileMVC';

@Module({
    imports: [
        // file upload multer module
        MulterModule.register({
            dest: filePath.PROFILE,
        }),
    ],
    controllers: [AccountController],
    providers: [AccountService, SocketService],
    exports: [AccountService],
})
export default class AccountModule {}
