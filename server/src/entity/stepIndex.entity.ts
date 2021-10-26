import { PrimaryGeneratedColumn, Column, Entity, OneToMany, JoinColumn } from 'typeorm';
import Action from './action.entity';

@Entity({ name: 'STEP_INDEX_TABLE' })
export default class StepIndex {
    @PrimaryGeneratedColumn()
    STEP_PK: number;
    @Column()
    STEP_LEVEL: number;
    @Column()
    STEP_NAME: string;

    @OneToMany(() => Action, (action) => action.step)
    actions: Action[];
}
