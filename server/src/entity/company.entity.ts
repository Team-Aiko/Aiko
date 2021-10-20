import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { CompanyTable } from '../interfaces';
import { User } from '.';

@Entity({ name: 'COMPANY_TABLE' })
export default class Company implements CompanyTable {
    @PrimaryGeneratedColumn()
    COMPANY_PK: number;
    @Column()
    COMPANY_NAME: string;
    @Column()
    CREATE_DATE: number;

    @OneToMany(() => User, (user) => user.company)
    user: User[];
}
