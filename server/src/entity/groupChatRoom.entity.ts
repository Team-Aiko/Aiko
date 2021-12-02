import { PrimaryGeneratedColumn, Column, Entity, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '.';

@Entity({ name: 'GROUP_CHAT_ROOM_TABLE' })
export default class GroupChatRoom {
    @PrimaryGeneratedColumn()
    GC_PK: number;

    @Column()
    COMPANY_PK: number;

    @Column()
    MAX_NUM: number;

    @Column()
    ROOM_ADMIN: number;

    @ManyToOne(() => User, (user) => user.groupChatRooms)
    @JoinColumn({ name: 'ROOM_ADMIN' })
    admin: User;
}
