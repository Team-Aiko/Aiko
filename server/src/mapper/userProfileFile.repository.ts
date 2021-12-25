import { ResultSetHeader } from 'mysql2';
import UserProfileFile from 'src/entity/userProfileFile.entity';
import { AikoError } from 'src/Helpers';
import { stackAikoError } from 'src/Helpers/functions';
import { headErrorCode } from 'src/interfaces/MVC/errorEnums';
import { IFileBundle } from 'src/interfaces/MVC/fileMVC';
import { EntityManager, EntityRepository, Repository, TransactionManager } from 'typeorm';

enum userProfileError {
    insertProfileImage = 1,
    viewProfileFile = 2,
}

@EntityRepository(UserProfileFile)
export default class UserProfileFileRepository extends Repository<UserProfileFile> {
    async insertProfileImage({ FILE_NAME, ORIGINAL_NAME }: IFileBundle, @TransactionManager() manager?: EntityManager) {
        try {
            const fracture = manager ? manager.createQueryBuilder() : this.createQueryBuilder();

            const insertedResult = await fracture
                .insert()
                .into(UserProfileFile)
                .values({
                    ORIGINAL_NAME,
                    FILE_NAME,
                })
                .execute();
            return (insertedResult.raw as ResultSetHeader).insertId;
        } catch (err) {
            throw stackAikoError(
                err,
                'UserProfileFileRepository/insertProfileImage',
                500,
                headErrorCode.userProfileFileDB + userProfileError.insertProfileImage,
            );
        }
    }

    async viewProfileFile(USER_PROFILE_PK: number) {
        try {
            return await this.createQueryBuilder('pf')
                .where('pf.USER_PROFILE_PK = :USER_PROFILE_PK', { USER_PROFILE_PK })
                .getOneOrFail();
        } catch (err) {
            throw stackAikoError(
                err,
                'UserProfileFileRepository/viewProfileFile',
                500,
                headErrorCode.userProfileFileDB + userProfileError.viewProfileFile,
            );
        }
    }
}
