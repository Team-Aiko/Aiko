import { Repository, EntityRepository, getConnection } from 'typeorm';
import { Country } from 'src/entity';
import { ICountryRepository } from 'src/interfaces/repositories';

@EntityRepository(Country)
export default class CountryRepository extends Repository<Country> implements ICountryRepository {
    async getCountryList(str: string): Promise<Country[]> {
        return await this.createQueryBuilder('c')
            .where('c.COUNTRY_NAME like :countryName', { countryName: `${str}%` })
            .getMany();
    }
}
