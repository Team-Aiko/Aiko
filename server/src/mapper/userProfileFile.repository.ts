import { ResultSetHeader } from 'mysql2';
import UserProfileFile from 'src/entity/userProfileFile.entity';
import { AikoError } from 'src/Helpers';
import { IFileBundle } from 'src/interfaces/MVC/fileMVC';
import { EntityManager, EntityRepository, Repository, SelectQueryBuilder, TransactionManager } from 'typeorm';

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
            console.error(err);
            throw new AikoError('UserProfileFileRepository/insertProfileImage', 500, 129384);
        }
    }
}
