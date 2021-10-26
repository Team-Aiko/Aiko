import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '.';
import { DepartmentTable } from '../interfaces';

@Entity({ name: 'DEPARTMENT_TABLE' })
export default class Department implements DepartmentTable {
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

    @ManyToOne(() => Department, (dept) => dept.children)
    @JoinColumn({ name: 'PARENT_PK' })
    parent: Department;

    @OneToMany(() => Department, (dept) => dept.parent)
    @JoinColumn({ name: 'DEPARTMENT_PK' })
    children: Department[];
}
