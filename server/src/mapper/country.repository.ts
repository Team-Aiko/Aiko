import { Repository, EntityRepository, getConnection } from 'typeorm';
import { Country } from 'src/entity';
import { ICountryRepository } from 'src/interfaces/repositories';
import { AikoError } from 'src/Helpers/classes';

@EntityRepository(Country)
export default class CountryRepository extends Repository<Country> implements ICountryRepository {
    async getCountryList(str: string): Promise<Country[]> {
        try {
            return await this.createQueryBuilder('c')
                .where('c.COUNTRY_NAME like :COUNTRY_NAME', { COUNTRY_NAME: `${str}%` })
                .getMany();
        } catch (err) {
            new AikoError('select error(country list)', 500, 500011);
        }
    }
}
