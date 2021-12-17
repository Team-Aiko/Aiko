import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import FileController from 'src/controllers/file.controller';
import FileService from 'src/services/file.service';

@Module({
    imports: [MulterModule.register()],
    controllers: [FileController],
    providers: [FileService],
})
export default class FileModule {}
