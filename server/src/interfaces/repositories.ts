import { Country, User } from 'src/entity';
export interface IUserRepository {
    checkDuplicateEmail(email: string): Promise<number>;
    getUserInfoWithEmail(email: string): Promise<User>;
}

export interface ICountryRepository {
    getCountryList(str: string): Promise<Country[]>;
}

export interface IResetPwRepository {
    requestResetPassword(email: string): Promise<boolean>;
}
