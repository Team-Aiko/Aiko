import { Module } from '@nestjs/common';
import NoticeBoardController from 'src/controllers/noticeBoard.controller';
import NoticeBoardService from 'src/services/noticeBoard.service';
@Module({
    controllers: [NoticeBoardController],
    providers: [NoticeBoardService],
    exports: [NoticeBoardService],
})
export default class NoticeBoardModule {}
