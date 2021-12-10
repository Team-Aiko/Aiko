import { PrimaryGeneratedColumn, Column, Entity, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '.';
import FileKeys from './fileKeys.entity';

@Entity({ name: 'FILE_HISTORY_TABLE' })
export default class FileHistory {
    @PrimaryGeneratedColumn()
    FH_PK: number;
    @Column()
    FILE_KEY_PK: number;
    @Column()
    USER_PK: number;
    @Column()
    ORIGINAL_FILE_NAME: string;
    @Column()
    NAME: string;
    @Column()
    SIZE: number;
    @Column()
    DATE: number;

    @ManyToOne(() => FileKeys, (fileKey) => fileKey.fileHistories)
    @JoinColumn({ name: 'FILE_KEY_PK' })
    fileKey: FileKeys;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'USER_PK' })
    user: User;
}
