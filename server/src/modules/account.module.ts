import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import AccountController from 'src/controllers/account.controller';
import AccountService from '../services/account.service';

@Module({
    imports: [
        // file upload multer module
        MulterModule.register({
            dest: './files/profile',
        }),
    ],
    controllers: [AccountController],
    providers: [AccountService],
})
export class AccountModule {}
