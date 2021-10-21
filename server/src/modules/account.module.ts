import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import AccountController from 'src/controllers/account.controller';
import AccountService from '../services/account.service';
import { Company, Country, Department, LoginAuth, ResetPw, User } from '../entity';
import SocketService from 'src/services/socket.service';

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
