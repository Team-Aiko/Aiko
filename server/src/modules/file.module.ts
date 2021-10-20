import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import FileController from 'src/controllers/file.controller';
import FileService from 'src/services/file.service';
import {
    CompanyRepository,
    DepartmentRepository,
    CountryRepository,
    LoginAuthRepository,
    ResetPwRepository,
    SocketRepository,
    UserRepository,
    ChatFileRepository,
} from '../entity';

@Module({
    imports: [
        MulterModule.register({
            dest: './files',
        }),
        TypeOrmModule.forFeature([UserRepository, SocketRepository, ChatFileRepository]),
    ],
    controllers: [FileController],
    providers: [FileService],
})
export default class FileModule {}
