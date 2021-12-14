import { PrimaryGeneratedColumn, Column, Entity, OneToMany, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'APPROVAL_FRAME_TABLE' })
export default class ApprovalFrame {
    @PrimaryGeneratedColumn()
    AF_PK: number;

    @Column()
    USER_PK: number;

    @Column()
    TITLE: string;

    @Column()
    CONTENT: string;

    @Column()
    COMPANY_PK: number;

    @Column()
    AC_PK: number;

    @Column()
    DEPARTMENT_PK: number;

    @Column()
    CURRENT_STEP_LEVEL: number;

    @Column()
    AS_PK: number;

    @Column()
    START_DATE: number;

    @Column()
    END_DATE: number;
}
