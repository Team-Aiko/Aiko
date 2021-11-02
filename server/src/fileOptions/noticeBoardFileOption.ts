import { diskStorage } from 'multer';

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
