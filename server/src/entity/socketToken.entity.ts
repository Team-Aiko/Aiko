import { PrimaryGeneratedColumn, Column, Entity, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '.';

@Entity({ name: 'SOCKET_TOKEN_TABLE' })
export default class SocketToken {
    @PrimaryGeneratedColumn()
    TOKEN_PK: number;

    @Column()
    USER_PK: number;

    @Column()
    COMPANY_PK: number;

    @Column()
    TOKEN_STR: string;

    @Column()
    DATE: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'USER_PK' })
    User: User;
}
