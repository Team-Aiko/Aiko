import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '.';

@Entity({ name: 'USER_PROFILE_FILE_TABLE' })
export default class UserProfileFile {
    @PrimaryGeneratedColumn()
    USER_PROFILE_PK: number;
    @Column()
    ORIGINAL_NAME: string;
    @Column()
    FILE_NAME: string;

    @OneToOne(() => User, (user) => user.profile)
    user: User;
}
