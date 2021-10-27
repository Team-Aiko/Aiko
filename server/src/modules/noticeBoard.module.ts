import { Module } from '@nestjs/common';
import NoticeBoardController from 'src/controllers/noticeBoard.controller';
import NoticeBoardService from 'src/services/noticeBoard.service';
import { MulterModule } from '@nestjs/platform-express';
import { APP_GUARD } from '@nestjs/core';
import { UserGuard } from 'src/guard/user.guard';
@Module({
    imports: [
        // file upload multer module
        MulterModule.register({
            dest: './files/noticeboard',
        }),
    ],
    controllers: [NoticeBoardController],
    providers: [NoticeBoardService],
    exports: [NoticeBoardService],
})
export default class NoticeBoardModule {}
