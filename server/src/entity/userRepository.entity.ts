import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export default class UserRepository {
    @PrimaryGeneratedColumn()
    USER_PK: number;
    @Column()
    NICKNAME: string;
    @Column()
    PASSWORD: string;
    @Column()
    SALT: string;
    @Column()
    FIRST_NAME: string;
    @Column()
    LAST_NAME: string;
    @Column()
    EMAIL: string;
    @Column()
    TEL: string;
    @Column()
    CREATE_DATE: number;
    @Column({ default: 0 })
    IS_DELETED: number;
    @Column({ default: 0 })
    IS_VERIFIED: number;
    @Column()
    COMPANY_PK: number;
    @Column()
    DEPARTMENT_PK: number;
    @Column()
    PROFILE_FILE_NAME: string;
}
