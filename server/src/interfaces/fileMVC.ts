import { Express, Request, Response } from 'express';
export interface IFileService {
    uploadFilesOnChatMsg(fileRoot: string, sender: number, receiver: number): Promise<number>;
    viewFilesOnChatMsg(fileId: number): Promise<string>;
}

export interface IFileController {
    uploadFilesOnChatMsg(req: Request, file: Express.Multer.File, res: Response): void;
    viewFilesOnChatMsg(req: Request, res: Response): void;
}
