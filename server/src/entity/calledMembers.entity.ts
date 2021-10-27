import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'CALLED_MEMBERS_TABLE' })
export default class Meet {
    @PrimaryGeneratedColumn()
    ROOM_PK: number;
    @Column()
    USER_PK: string;
    @Column()
    MEET_PK: string;
}
