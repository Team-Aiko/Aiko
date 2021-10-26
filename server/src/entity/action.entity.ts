import { PrimaryGeneratedColumn, Column, Entity, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
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
}
