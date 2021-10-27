import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '.';
import Meet from './meet.entity';

@Entity({ name: 'CALLED_MEMBERS_TABLE' })
export default class CalledMembers {
    @PrimaryGeneratedColumn()
    CALL_PK: number;
    @Column()
    USER_PK: string;
    @Column()
    MEET_PK: string;

    @ManyToOne(() => Meet, (meet) => meet.members)
    @JoinColumn({ name: 'MEET_PK' })
    meet: Meet;

    @ManyToOne(() => User, (user) => user.calledMembers)
    @JoinColumn({ name: 'USER_PK' })
    user: User;
}
