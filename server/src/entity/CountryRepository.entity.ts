import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { CountryTable } from '../interfaces';

@Entity({ name: 'COUNTRY_TABLE' })
export default class CountryRepository implements CountryTable {
    @PrimaryGeneratedColumn()
    COUNTRY_PK: number;

    @Column()
    COUNTRY_NAME: string;
}
