import { PrimaryGeneratedColumn, Column, Entity, OneToMany, JoinColumn } from 'typeorm';
import { isGeneratorFunction } from 'util/types';
import Grant from './Grant.entity';

@Entity({ name: 'AUTH_LIST_TABLE' })
export default class AuthListTable {
    @PrimaryGeneratedColumn()
    AUTH_LIST_PK: number;

    @Column()
    AUTH_NAME: string;
}
