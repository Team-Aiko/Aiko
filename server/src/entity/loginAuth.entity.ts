import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { User } from '.';
import { LoginAuthTable } from '../interfaces';

@Entity({ name: 'LOGIN_AUTH_TABLE' })
export default class LoginAuth implements LoginAuthTable {
    @PrimaryGeneratedColumn()
    LOGIN_AUTH_PK: number;
    @Column()
    USER_PK: number;
    @Column()
    UUID: string;
    @OneToOne(() => User, (user) => user.loginAuth)
    user: User;
}
