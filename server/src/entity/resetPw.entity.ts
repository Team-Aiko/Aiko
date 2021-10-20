import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ResetPwTable } from '../interfaces';
import { User } from '.';

@Entity({ name: 'RESET_PW_TABLE' })
export default class ResetPw implements ResetPwTable {
    @PrimaryGeneratedColumn()
    RESET_PK: number;
    @Column()
    USER_PK: number;
    @Column()
    UUID: string;

    @ManyToOne((type) => User, (user) => user.resetPws)
    user: User;
}
