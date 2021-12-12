import { PrimaryGeneratedColumn, Column, Entity, OneToMany, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { FileKeys, User } from '.';

@Entity({ name: 'FILE_BIN_TABLE' })
export default class FileBin {
    @PrimaryGeneratedColumn()
    FB_PK: number;

    @Column()
    FILE_KEY_PK: number;

    @Column()
    DATE: number;

    @Column()
    USER_PK: number;

    @Column()
    COMPANY_PK: number;

    @OneToOne(() => FileKeys)
    @JoinColumn({ name: 'FILE_KEY_PK' })
    fileKey: FileKeys;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'USER_PK' })
    user: User;
}
