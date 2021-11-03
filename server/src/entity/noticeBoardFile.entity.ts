import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'NOTICE_BOARD_FILE_TABLE' })
export default class NoticeBoardFile {
    @PrimaryGeneratedColumn()
    NBF_PK: number;

    @Column()
    UUID: string;

    @Column()
    NOTICE_BOARD_PK: number;

    @Column()
    USER_PK: number;

    @Column()
    ORIGINAL_NAME: number;

    @Column()
    IS_DELETE: number;
}
