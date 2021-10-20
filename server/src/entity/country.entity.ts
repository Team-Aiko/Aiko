import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from '.';
import { CountryTable } from '../interfaces';

@Entity({ name: 'COUNTRY_TABLE' })
export default class Country implements CountryTable {
    @PrimaryGeneratedColumn()
    COUNTRY_PK: number;

    @Column()
    COUNTRY_NAME: string;

    @OneToMany(() => User, (user) => user.country)
    users: User[];
}
