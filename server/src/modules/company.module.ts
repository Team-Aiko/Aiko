import { Module } from '@nestjs/common';
import CompanyController from 'src/controllers/company.controller';
import AccountService from 'src/services/account.service';
import CompanyService from 'src/services/company.service';
import SocketService from 'src/services/socket.service';

@Module({
    controllers: [CompanyController],
    providers: [CompanyService, AccountService, SocketService],
    exports: [CompanyService],
})
export default class CompanyModule {}
