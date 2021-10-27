import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import Meet from './meet.entity';

@Entity({ name: 'MEET_ROOM_TABLE' })
export default class MeetRoom {
    @PrimaryGeneratedColumn()
    ROOM_PK: number;
    @Column()
    ROOM_NAME: string;
    @Column()
    LOCATE: string;
    @Column()
    COMPANY_PK: number;
    @Column()
    IS_ONLINE: number;

    @OneToMany(() => Meet, (meet) => meet.room)
    meets: Meet[];
}
