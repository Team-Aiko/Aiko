import {
    JoinColumn,
    OneToOne,
    Column,
    Entity,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { UserTable } from '../interfaces';
import { CompanyRepository, CountryRepository, LoginAuthRepository, ResetPwRepository, SocketRepository } from '.';
import { DepartmentRepository } from '.';

@Entity({ name: 'USER_TABLE' })
export default class UserRepository implements UserTable {
    @PrimaryGeneratedColumn()
    USER_PK: number;

    @Column({ type: 'varchar', length: 20, unique: true })
    NICKNAME: string;

    @Column({ type: 'varchar', length: 512, nullable: false })
    PASSWORD: string;

    @Column({ type: 'varchar', length: 128, nullable: false })
    SALT: string;

    @Column({ type: 'varchar', length: 20, nullable: false })
    FIRST_NAME: string;

    @Column({ type: 'varchar', length: 20, nullable: false })
    LAST_NAME: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    EMAIL: string;

    @Column({ type: 'varchar', length: 30, nullable: false })
    TEL: string;

    @Column({ type: 'integer', nullable: false })
    CREATE_DATE: number;

    @Column({ type: 'integer', default: 0, nullable: false })
    IS_DELETED: number;

    @Column({ type: 'integer', default: 0, nullable: false })
    IS_VERIFIED: number;

    @Column({ type: 'integer' })
    COMPANY_PK: number;

    @Column({ type: 'integer' })
    DEPARTMENT_PK: number;

    @Column({ type: 'integer', nullable: false })
    COUNTRY_PK: number;

    @Column({ type: 'varchar', length: 2000 })
    PROFILE_FILE_NAME: string;

    @ManyToOne((type) => CompanyRepository, (company) => company.user)
    @JoinColumn({ name: 'COMPANY_PK' })
    company: CompanyRepository;

    @ManyToOne((type) => DepartmentRepository, (department) => department.users)
    @JoinColumn({ name: 'DEPARTMENT_PK' })
    department: DepartmentRepository;

    @OneToOne((type) => LoginAuthRepository, (loginAuth) => loginAuth.user)
    loginAuth: LoginAuthRepository;

    @ManyToOne((type) => CountryRepository, (country) => country.users)
    @JoinColumn({ name: 'COUNTRY_PK' })
    country: CountryRepository;

    @OneToMany((type) => ResetPwRepository, (resetPw) => resetPw.user)
    resetPws: ResetPwRepository[];

    @OneToOne(() => SocketRepository, (socket) => socket.user)
    socket: SocketRepository;
}
