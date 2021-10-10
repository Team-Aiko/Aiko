import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { DepartmentTable } from '../interfaces';

@Entity({ name: 'DEPARTMENT_TABLE' })
export default class DeaprtmentRepository implements DepartmentTable {
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
}
