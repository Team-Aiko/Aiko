import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from '.';
import { DepartmentTable } from '../interfaces';

@Entity({ name: 'DEPARTMENT_TABLE' })
export default class Deaprtment implements DepartmentTable {
    @PrimaryGeneratedColumn()
    DEPARTMENT_PK: number;
    @Column()
    DEPARTMENT_NAME: string;
    @Column()
    COMPANY_PK: number;
    @Column()
    PARENT_PK: number;
    @Column()
    DEPTH: number;
    @OneToMany(() => User, (user) => user.department)
    users: User[];
}
