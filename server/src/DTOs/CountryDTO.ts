import { CountryRepository } from 'src/entity';
import { CountryTable } from '../interfaces';

export default class CountryDTO implements CountryTable {
    COUNTRY_PK: number;
    COUNTRY_NAME: string;

    set countryName(countryName: string) {
        this.COUNTRY_NAME = countryName;
    }
}
