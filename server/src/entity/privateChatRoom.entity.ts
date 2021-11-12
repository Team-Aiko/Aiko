import { PrimaryColumn, Column, Entity, ManyToMany, OneToMany, JoinColumn } from 'typeorm';
import { User } from '.';

@Entity({ name: 'PRIVATE_CHAT_ROOM_TABLE' })
export default class PrivateChatRoom {
    @PrimaryColumn()
    CR_PK: string;
    @Column()
    USER_1: number;
    @Column()
    USER_2: number;
    @Column()
    COMPANY_PK: number;

    @OneToMany(() => User, (user) => user.socket1)
    @JoinColumn({ name: 'USER_1' })
    user1: User;

    @OneToMany(() => User, (user) => user.socket2)
    @JoinColumn({ name: 'USER_2' })
    user2: User;
}
