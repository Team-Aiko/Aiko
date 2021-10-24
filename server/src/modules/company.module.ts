import { Module } from '@nestjs/common';
import CompanyController from 'src/controllers/company.controller';
import AccountService from 'src/services/account.service';
import CompanyService from 'src/services/company.service';

@Module({
    controllers: [CompanyController],
    providers: [CompanyService, AccountService],
    exports: [CompanyService],
})
export default class CompanyModule {}
