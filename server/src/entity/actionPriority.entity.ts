import { PrimaryGeneratedColumn, Column, Entity, OneToMany, JoinColumn } from 'typeorm';
import Action from './action.entity';

@Entity({ name: 'ACTION_PRIORITY_TABLE' })
export default class ActionPriority {
    @PrimaryGeneratedColumn()
    P_PK: number;
    @Column()
    PRIORITY_NAME: string;

    @OneToMany(() => Action, (action) => action.priority)
    actions: Action[];
}
