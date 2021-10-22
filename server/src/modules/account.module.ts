import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import AccountController from 'src/controllers/account.controller';
import AccountService from 'src/services/account.service';
import SocketService from 'src/services/socket.service';
import { Company, Country, Department, LoginAuth, ResetPw, User } from '../entity';

@Module({
    imports: [
        // file upload multer module
        MulterModule.register({
            dest: './files/profile',
        }),
        TypeOrmModule.forFeature([Company, Country, Department, LoginAuth, ResetPw, User]),
    ],
    controllers: [AccountController],
    providers: [AccountService, SocketService],
    exports: [AccountService],
})
export default class AccountModule {}
