import { Injectable } from '@nestjs/common';

@Injectable()
export default class DriveService {
    async saveFiles(files: Express.Multer.File[]) {
        try {
        } catch (err) {
            throw err;
        }
    }
}
