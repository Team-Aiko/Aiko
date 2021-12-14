import { PrimaryGeneratedColumn, Column, Entity, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import FileHistory from './fileHistory.entity';
import FileKeys from './fileKeys.entity';

@Entity({ name: 'FILE_FOLDER_TABLE' })
export default class FileFolder {
    @PrimaryGeneratedColumn()
    FOLDER_PK: number;
    @Column()
    COMPANY_PK: number;
    @Column()
    FOLDER_NAME: string;
    @Column()
    SIZE: number;
    @Column()
    PARENT_PK: number;

    @OneToMany(() => FileKeys, (fileKeys) => fileKeys.folder)
    @JoinColumn({ name: 'FOLDER_PK' })
    fileKeys: FileKeys[];

    children: FileFolder[];
}
