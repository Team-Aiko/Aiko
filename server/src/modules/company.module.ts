import { Module } from '@nestjs/common';
import CompanyController from 'src/controllers/company.controller';
import CompanyService from 'src/services/company.service';
import { AccountModule } from '.';

@Module({
    imports: [AccountModule],
    controllers: [CompanyController],
    providers: [CompanyService],
    exports: [CompanyService],
})
export default class CompanyModule {}
