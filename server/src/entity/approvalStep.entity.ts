import { PrimaryGeneratedColumn, Column, Entity, OneToMany, JoinColumn, ManyToOne } from 'typeorm';

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
    STEP_STATUS: string;
}
