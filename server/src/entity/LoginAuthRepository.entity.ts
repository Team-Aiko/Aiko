import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { LoginAuthTable } from '../interfaces';

@Entity({ name: 'LOGIN_AUTH_TABLE' })
export default class LoginAuthRepository implements LoginAuthTable {
    @PrimaryGeneratedColumn()
    LOGIN_AUTH_PK: number;
    @Column()
    USER_PK: number;
    @Column()
    UUID: string;
}
