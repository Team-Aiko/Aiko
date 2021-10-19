import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import SocketService from 'src/services/socket.service';
import {
    CompanyRepository,
    DepartmentRepository,
    CountryRepository,
    LoginAuthRepository,
    ResetPwRepository,
    SocketRepository,
    UserRepository,
} from '../entity';
@Module({
    imports: [
        TypeOrmModule.forFeature([
            CompanyRepository,
            CountryRepository,
            DepartmentRepository,
            LoginAuthRepository,
            ResetPwRepository,
            UserRepository,
            SocketRepository,
        ]),
    ],
    providers: [SocketService],
    exports: [SocketService],
})
export default class ChatModule {}
