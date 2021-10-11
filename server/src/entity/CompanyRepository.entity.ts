import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { CompanyTable } from '../interfaces';
import { UserRepository } from '.';

@Entity({ name: 'COMPANY_TABLE' })
export default class CompanyRepository implements CompanyTable {
    @PrimaryGeneratedColumn()
    COMPANY_PK: number;
    @Column()
    COMPANY_NAME: string;
    @Column()
    CREATE_DATE: number;

    @OneToMany(() => UserRepository, (user) => user.company)
    user: UserRepository[];
}
