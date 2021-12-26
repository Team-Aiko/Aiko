import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
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
    @JoinColumn({ name: 'USER_PK' })
    user: User;
}
