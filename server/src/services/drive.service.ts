import { Injectable } from '@nestjs/common';
import FileHistory from 'src/entity/fileHistory.entity';
import FileKeys from 'src/entity/fileKeys.entity';
import { getRepo, unixTimeStamp } from 'src/Helpers';
import FileHistoryRepository from 'src/mapper/fileHistory.repository';
import FileKeysRepository from 'src/mapper/fileKeys.repository';
import { getConnection } from 'typeorm';

@Injectable()
export default class DriveService {
    async saveFiles(folderPK: number, USER_PK: number, files: Express.Multer.File[]) {
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.startTransaction();
        const DATE = unixTimeStamp();

        let fileKeysList: Pick<FileKeys, 'FILE_KEY_PK'>[] = [];
        let historyKeyList: Pick<FileHistory, 'FH_PK'>[] = [];

        try {
            fileKeysList = await getRepo(FileKeysRepository).createFileKeys(
                files.length,
                folderPK,
                queryRunner.manager,
            );

            const fileHistoryList = files.map((file, idx) => ({
                DATE,
                FILE_KEY_PK: fileKeysList[idx].FILE_KEY_PK,
                NAME: file.filename,
                ORIGINAL_NAME: file.originalname,
                SIZE: file.size,
                USER_PK,
            }));

            historyKeyList = await getRepo(FileHistoryRepository).createFileHistory(
                fileHistoryList,
                queryRunner.manager,
            );

            await queryRunner.commitTransaction();
        } catch (err) {
            console.log('🚀 ~ file: drive.service.ts ~ line 33 ~ DriveService ~ saveFiles ~ err', err);
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
            return { fileKeysList, historyKeyList };
        }
    }
}
