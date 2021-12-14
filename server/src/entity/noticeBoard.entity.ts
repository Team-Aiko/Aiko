import { Column, Entity, OneToMany, PrimaryGeneratedColumn, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import { NoticeBoardFile, User } from '.';
@Entity({ name: 'NOTICE_BOARD_TABLE' })
export default class NoticeBoard {
    @PrimaryGeneratedColumn()
    NOTICE_BOARD_PK: number;

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

    @Column()
    UPDATE_USER_PK: number;

    @OneToMany(() => NoticeBoardFile, (nbf) => nbf.nb)
    @JoinColumn({ name: 'NOTICE_BOARD_PK' })
    files: NoticeBoardFile[];

    @ManyToOne(() => User, (nb) => nb.user)
    @JoinColumn({ name: 'USER_PK' })
    user: User;

    @ManyToOne(() => User, (nb) => nb.updateUser)
    @JoinColumn({ name: 'UPDATE_USER_PK' })
    updateUser: User;
}
