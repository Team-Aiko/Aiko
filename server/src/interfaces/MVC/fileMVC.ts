import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
export interface IFileBundle {
    ORIGINAL_NAME: string;
    FILE_NAME: string;
    FILE_SIZE?: number;
}

export enum filePath {
    PROFILE = './files/profile/',
    CHAT = './files/chatFiles/',
    NOTICE_BOARD = './files/noticeboard',
    DRIVE = './files/drive',
}

export const NoticeBoardFileOption: MulterOptions = {
    limits: {
        fileSize: 1 * 1000 * 1000,
    },
    storage: diskStorage({
        destination: function (req, files, callback) {
            const dest = filePath.NOTICE_BOARD;
            callback(null, dest);
        }, // 저장위치
    }),
};

export const driveFileOption: MulterOptions = {
    storage: diskStorage({
        destination: function (req, files, callback) {
            const dest = filePath.DRIVE;
            callback(null, dest);
        },
    }),
};
