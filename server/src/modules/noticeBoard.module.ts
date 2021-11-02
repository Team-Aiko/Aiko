import { HttpException, HttpStatus, Module, Res } from '@nestjs/common';
import NoticeBoardController from 'src/controllers/noticeBoard.controller';
import NoticeBoardService from 'src/services/noticeBoard.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AikoError } from 'src/Helpers';
@Module({
    // imports: [
    //     // file upload multer module
    //     MulterModule.registerAsync({
    //         useFactory: () => ({
    //             // limits: {
    //             //     fileSize: 1 * 1000 * 1000,
    //             //     files: 3,
    //             // },
    //             // fileFilter: function (req, files, cb) {
    //             //     console.log(files.mimetype);
    //             //     if (files.mimetype.match(/\/(jpg|jpeg|plain|zip)$/)) {
    //             //         cb(null, true);
    //             //     } else {
    //             //         cb(
    //             //             new HttpException({
    //             //                     httpCode: 451,
    //             //                     description: '지원하지않는 파일 형식입니다',
    //             //                     appCode: 451000,
    //             //                     result: false,
    //             //                 },
    //             //                 400,
    //             //             ),
    //             //             false,
    //             //         );
    //             //     }
    //             // }, // 파일필터
    //             storage: diskStorage({
    //                 destination: function (req, files, cb) {
    //                     const dest = './files/noticeboard';
    //                     cb(null, dest);
    //                 }, // 저장위치
    //             }),
    //         }),
    //     }),
    // ],
    controllers: [NoticeBoardController],
    providers: [NoticeBoardService],
    exports: [NoticeBoardService],
})
export default class NoticeBoardModule {}
