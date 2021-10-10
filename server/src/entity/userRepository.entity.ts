import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { UserTable } from '../interfaces';
import { CompanyRepository } from '.';
import DeaprtmentRepository from './DepartmentRepository.entity';

@Entity({ name: 'USER_TABLE' })
export default class UserRepository implements UserTable {
    @PrimaryGeneratedColumn()
    USER_PK: number;
    @Column()
    NICKNAME: string;
    @Column()
    PASSWORD: string;
    @Column()
    SALT: string;
    @Column()
    FIRST_NAME: string;
    @Column()
    LAST_NAME: string;
    @Column()
    EMAIL: string;
    @Column()
    TEL: string;
    @Column()
    CREATE_DATE: number;
    @Column({ default: 0 })
    IS_DELETED: number;
    @Column({ default: 0 })
    IS_VERIFIED: number;
    @Column()
    COMPANY_PK: number;
    @Column()
    DEPARTMENT_PK: number;
    @Column()
    COUNTRY_PK: number;
    @Column()
    PROFILE_FILE_NAME: string;
    @Column()
    COUNTRY: string;
    @ManyToOne((type) => CompanyRepository, (company) => company.COMPANY_PK)
    company: CompanyRepository;
    @ManyToOne((type) => DeaprtmentRepository, (company) => company.DEPARTMENT_PK)
    department: DeaprtmentRepository;
}
