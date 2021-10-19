import { SocketTable } from '../interfaces';
import { OneToOne, PrimaryGeneratedColumn, Column, Entity, JoinColumn } from 'typeorm';
import { UserRepository } from '.';

@Entity({ name: 'SOCKET_TABLE' })
export default class SocketRepository implements SocketTable {
    @PrimaryGeneratedColumn()
    SOCKET_PK: number;
    @Column()
    SOCKET_ID: string;
    @Column()
    USER_PK: number;

    @OneToOne(() => UserRepository, (user) => user.socket)
    @JoinColumn({ name: 'USER_PK' })
    user: UserRepository;
}
