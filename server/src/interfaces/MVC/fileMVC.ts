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
