import { SocketTable } from '../interfaces';
import { OneToOne, PrimaryGeneratedColumn, Column, Entity, JoinColumn } from 'typeorm';
import { User } from '.';

@Entity({ name: 'SOCKET_TABLE' })
export default class Socket implements SocketTable {
    @PrimaryGeneratedColumn()
    SOCKET_PK: number;
    @Column()
    SOCKET_ID: string;
    @Column()
    USER_PK: number;

    @OneToOne(() => User, (user) => user.socket)
    @JoinColumn({ name: 'USER_PK' })
    user: User;
}
