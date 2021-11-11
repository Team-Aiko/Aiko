import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '.';
import CalledMembers from './calledMembers.entity';
import MeetRoom from './meetRoom.entity';

@Entity({ name: 'MEET_TABLE' })
export default class Meet {
    @PrimaryGeneratedColumn()
    MEET_PK: number;
    @Column()
    TITLE: string;
    @Column()
    DESCRIPTION: string;
    @Column()
    MAX_MEM_NUM: number;
    @Column()
    ROOM_PK: number;
    @Column()
    DATE: number;
    @Column()
    IS_FINISHED: number;

    @ManyToOne(() => MeetRoom, (room) => room.meets)
    @JoinColumn({ name: 'ROOM_PK' })
    room: MeetRoom;

    @OneToMany(() => CalledMembers, (members) => members.meet)
    members: CalledMembers[];
}
