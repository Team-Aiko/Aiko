import { PrimaryGeneratedColumn, Column, Entity, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '.';
import ApprovalFrame from './approvalFrame.entity';
@Entity({ name: 'APPROVAL_STEP_TABLE' })
export default class ApprovalStep {
    @PrimaryGeneratedColumn()
    AS_PK: number;

    @Column()
    AF_PK: number;

    @Column()
    USER_PK: number;

    @Column()
    STEP_LEVEL: number;

    @Column()
    DECISION: number;

    @Column()
    SIGN_DATE: number;

    @Column()
    STEP_STATUS: number;

    @ManyToOne(() => User, (as) => as.asUser)
    @JoinColumn({ name: 'USER_PK' })
    asUser: User;

    @ManyToOne(() => ApprovalFrame, (as) => as.afPk)
    @JoinColumn({ name: 'AF_PK' })
    afPk: ApprovalFrame;
}
