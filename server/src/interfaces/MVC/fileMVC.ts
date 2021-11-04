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
}

export const NoticeBoardFileOption = {
    limits: {
        fileSize: 1 * 1000 * 1000,
    },
    storage: diskStorage({
        destination: function (req, files, callback) {
            const dest = './files/noticeboard';
            callback(null, dest);
        }, // 저장위치
    }),
};
