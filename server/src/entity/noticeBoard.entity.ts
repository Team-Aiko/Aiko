import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'NOTICE_BOARD_TABLE' })
export default class NoticeBoard {
    @PrimaryGeneratedColumn()
    NO: number;

    @Column()
    TITLE: string;

    @Column()
    CONTENT: string;

    @Column()
    USER_PK: number;

    @Column()
    CREATE_DATE: number;

    @Column()
    UPDATE_DATE: number;

    @Column()
    IS_DELETE: number;

    @Column()
    COMPANY_PK: number;
}