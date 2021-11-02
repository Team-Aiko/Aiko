import { diskStorage } from 'multer';

export const NoticeBoardFileOption = {
    limits: {
        fileSize: 1 * 1000 * 1000,
        files: 3,
    },
};
