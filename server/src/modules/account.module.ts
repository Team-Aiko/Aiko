import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import AccountController from 'src/controllers/account.controller';
import AccountService from '../services/account.service';
import {
    CompanyRepository,
    CountryRepository,
    DepartmentRepository,
    LoginAuthRepository,
    ResetPwRepository,
    UserRepository,
} from '../entity';

@Module({
    imports: [
        // file upload multer module
        MulterModule.register({
            dest: './files/profile',
        }),
        TypeOrmModule.forFeature([
            CompanyRepository,
            CountryRepository,
            DepartmentRepository,
            LoginAuthRepository,
            ResetPwRepository,
            UserRepository,
        ]),
    ],
    controllers: [AccountController],
    providers: [AccountService],
    exports: [AccountService],
})
export default class AccountModule {}
