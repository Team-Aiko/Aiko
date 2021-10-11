import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserRepository } from '.';
import { CountryTable } from '../interfaces';

@Entity({ name: 'COUNTRY_TABLE' })
export default class CountryRepository implements CountryTable {
    @PrimaryGeneratedColumn()
    COUNTRY_PK: number;

    @Column()
    COUNTRY_NAME: string;

    @OneToMany(() => UserRepository, (user) => user.country)
    users: UserRepository[];
}
