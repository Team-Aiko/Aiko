import { PrimaryGeneratedColumn, Column, Entity, OneToMany, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { FileFolder } from '.';

@Entity({ name: 'FOLDER_BIN_TABLE' })
export default class FolderBin {
    @PrimaryGeneratedColumn()
    FOLDER_BIN_PK: number;
    @Column()
    USER_PK: number;
    @Column()
    COMPANY_PK: number;
    @Column()
    FOLDER_PK: number;
    @Column()
    DATE: number;

    @OneToOne(() => FileFolder)
    @JoinColumn({ name: 'FOLDER_PK' })
    folder: FileFolder;
}
