import { PrimaryGeneratedColumn, Column, Entity, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { GroupChatRoom, User } from '.';

@Entity({ name: 'GROUP_CHAT_USER_LIST_TABLE' })
export default class GroupChatUserList {
    @PrimaryGeneratedColumn()
    GC_UL_PK: number;

    @Column()
    GC_PK: number;

    @Column()
    USER_PK: number;

    @ManyToOne(() => GroupChatRoom, (groupChatRoom) => groupChatRoom.members)
    @JoinColumn({ name: 'GC_PK' })
    groupChatRoom: GroupChatRoom;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'USER_PK' })
    user: User;
}
