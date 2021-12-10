import { PrimaryGeneratedColumn, Column, Entity, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import FileFolder from './fileFolder.entity';
import FileHistory from './fileHistory.entity';

@Entity({ name: 'FILE_KEYS_TABLE' })
export default class FileKeys {
    @PrimaryGeneratedColumn()
    FILE_KEY_PK: number;
    @Column()
    FOLDER_PK: number;
    @Column()
    IS_DELETED: number;

    @ManyToOne(() => FileFolder, (fileFolder) => fileFolder.fileKeys)
    @JoinColumn({ name: 'FOLDER_PK' })
    folder: FileFolder;

    @OneToMany(() => FileHistory, (fileHistory) => fileHistory.fileKey)
    @JoinColumn({ name: 'FILE_KEY_PK' })
    fileHistories: FileHistory[];
}
