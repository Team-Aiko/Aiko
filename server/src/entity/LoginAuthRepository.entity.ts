import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export default class LoginAuthRepository {
    @PrimaryGeneratedColumn()
    LOGIN_AUTH_PK: number;
    @Column()
    USER_PK: number;
    @Column()
    UUID: string;
}
