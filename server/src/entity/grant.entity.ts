import { PrimaryGeneratedColumn, Column, Entity, OneToMany, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { User } from '.';
import AuthListTable from './authList.entity';

@Entity({ name: 'GRANT_TABLE' })
export default class Grant {
    @PrimaryGeneratedColumn()
    GRNT_PK: number;

    @Column()
    USER_PK: number;

    @Column()
    AUTH_LIST_PK: number;

    @ManyToOne(() => AuthListTable, (authList) => authList.AUTH_LIST_PK)
    @JoinColumn({ name: 'AUTH_LIST_PK' })
    authList: AuthListTable;

    @ManyToOne(() => User, (user) => user.grants)
    @JoinColumn({ name: 'USER_PK' })
    user: User;
}
