import { PrimaryGeneratedColumn, Column, Entity, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '.';
import ApprovalStep from './approvalStep.entity';

@Entity({ name: 'APPROVAL_FRAME_TABLE' })
export default class ApprovalComment {
    @PrimaryGeneratedColumn()
    ACM_PK: number;

    @Column()
    AF_PK: number;

    @Column()
    USER_PK: number;

    @Column()
    COMMENT_DATE: number;

    @Column()
    COMPANY_PK: number;

    @Column()
    DEPARTMENT_PK: number;

    @Column()
    CONTENT: string;

    @Column()
    IS_DELETED: number;

    @ManyToOne(() => User, (af) => af.afUser)
    @JoinColumn({ name: 'USER_PK' })
    afUser: User;

    @OneToMany(() => ApprovalStep, (af) => af.afPk)
    @JoinColumn({ name: 'AF_PK' })
    afPk: ApprovalStep;

    // @OneToMany(() => ApprovalStep, (af) => af.afPk) //카테고리 테이블 조인
    // @JoinColumn({ name: 'AF_PK' })
    // afPk: ApprovalStep;
}
