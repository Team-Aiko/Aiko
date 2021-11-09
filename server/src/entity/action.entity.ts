import { PrimaryGeneratedColumn, Column, Entity, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { Department, User } from '.';
import ActionPriority from './actionPriority.entity';
import StepIndex from './stepIndex.entity';

@Entity({ name: 'ACTION_TABLE' })
export default class Action {
    @PrimaryGeneratedColumn()
    ACTION_PK: number;
    @Column()
    DEPARTMENT_PK: number;
    @Column()
    USER_PK: number;
    @Column()
    ASSIGNER_PK: number;
    @Column()
    STEP_PK: number;
    @Column()
    P_PK: number;
    @Column()
    START_DATE: number;
    @Column()
    DUE_DATE: number;
    @Column()
    IS_FINISHED: number;
    @Column()
    TITLE: string;
    @Column()
    DESCRIPTION: string;
    @Column()
    CREATE_DATE: number;

    // * joins
    @ManyToOne(() => ActionPriority, (priority) => priority.actions)
    @JoinColumn({ name: 'P_PK' })
    priority: ActionPriority;

    @ManyToOne(() => StepIndex, (stepIdx) => stepIdx.actions)
    @JoinColumn({ name: 'STEP_PK' })
    step: StepIndex;

    @ManyToOne(() => Department, (dept) => dept.actions)
    @JoinColumn({ name: 'DEPARTMENT_PK' })
    department: Department;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'USER_PK' })
    owner: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'ASSIGNER_PK' })
    assigner: User;
}
