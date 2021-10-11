import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ResetPwTable } from '../interfaces';
import { UserRepository } from '.';

@Entity({ name: 'RESET_PW_TABLE' })
export default class ResetPwRepository implements ResetPwTable {
    @PrimaryGeneratedColumn()
    RESET_PK: number;
    @Column()
    USER_PK: number;
    @Column()
    UUID: string;

    @ManyToOne((type) => UserRepository, (user) => user.resetPws)
    user: UserRepository;
}
