import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { UserRepository } from '.';
import { LoginAuthTable } from '../interfaces';

@Entity({ name: 'LOGIN_AUTH_TABLE' })
export default class LoginAuthRepository implements LoginAuthTable {
    @PrimaryGeneratedColumn()
    LOGIN_AUTH_PK: number;
    @Column()
    USER_PK: number;
    @Column()
    UUID: string;
    @OneToOne(() => UserRepository, (user) => user.loginAuth)
    user: UserRepository;
}
