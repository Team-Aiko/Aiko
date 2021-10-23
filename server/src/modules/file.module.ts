import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import FileController from 'src/controllers/file.controller';
import FileService from 'src/services/file.service';
import { Company, Department, Country, LoginAuth, ResetPw, Socket, User, ChatFile } from '../entity';

@Module({
    imports: [
        MulterModule.register({
            dest: './files',
        }),
    ],
    controllers: [FileController],
    providers: [FileService],
})
export default class FileModule {}
