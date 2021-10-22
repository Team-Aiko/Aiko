import {
    JoinColumn,
    OneToOne,
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    ManyToMany,
} from 'typeorm';
import { Department, Company, Country, LoginAuth, ResetPw, Socket, OTOChatRoom } from '.';

@Entity({ name: 'USER_TABLE' })
export default class User {
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

    @ManyToOne((type) => Company, (company) => company.user)
    @JoinColumn({ name: 'COMPANY_PK' })
    company: Company;

    @ManyToOne((type) => Department, (department) => department.users)
    @JoinColumn({ name: 'DEPARTMENT_PK' })
    department: Department;

    @OneToOne((type) => LoginAuth, (loginAuth) => loginAuth.user)
    loginAuth: LoginAuth;

    @ManyToOne((type) => Country, (country) => country.users)
    @JoinColumn({ name: 'COUNTRY_PK' })
    country: Country;

    @OneToMany((type) => ResetPw, (resetPw) => resetPw.user)
    resetPws: ResetPw[];

    @OneToOne(() => Socket, (socket) => socket.user)
    socket: Socket;

    @ManyToMany(() => OTOChatRoom, (otoChatRoom) => otoChatRoom.USER_1)
    socket1: OTOChatRoom[];

    @ManyToMany(() => OTOChatRoom, (otoChatRoom) => otoChatRoom.USER_2)
    socket2: OTOChatRoom[];
}
