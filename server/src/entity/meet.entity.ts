import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

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
}
