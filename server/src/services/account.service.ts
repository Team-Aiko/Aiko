/* eslint-disable no-unused-vars */
import { Injectable } from '@nestjs/common';
import { getManager, getConnection } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { UserRepository, LoginAuthRepository, CountryRepository } from '../entity';
import { IAccountService, ISignup, SelectData } from '../interfaces';
// import { UserDTO } from '../DTOs';

@Injectable()
export default class AccountService implements IAccountService {
    constructor(
        @InjectRepository(UserRepository)
        private userRepo: Repository<UserRepository>,
        @InjectRepository(LoginAuthRepository)
        private loginAuthRepo: Repository<LoginAuthRepository>,
        @InjectRepository(CountryRepository)
        private countryRepo: Repository<CountryRepository>,
    ) {}

    checkDuplicateEmail(email: string, res: Response<any, Record<string, any>>): void {
        const result = this.userRepo.findOne({ EMAIL: email });
        result.then((data) => res.send(data));
    }
    getCountryList(str: string, res: Response<any, Record<string, any>>): void {
        const result = this.countryRepo
            .createQueryBuilder('u')
            .where('u.COUNTRY_NAME like :countryName', { countryName: `${str}%` })
            .getMany();
        result.then((data) => res.send(data));
        throw new Error('Method not implemented.');
    }
    signup(data: ISignup, imageRoute: string, res: Response<any, Record<string, any>>) {
        throw new Error('Method not implemented.');
    }
    grantLoginAuth(id: string, res: Response<any, Record<string, any>>): void {
        (async () => {
            const queryRunner = await getConnection().createQueryRunner();
            await queryRunner.startTransaction();
            try {
                const result1 = await this.loginAuthRepo
                    .createQueryBuilder('l')
                    .where('l.UUID = :uuid', { uuid: id })
                    .getOne();
                await getConnection()
                    .createQueryBuilder()
                    .update(UserRepository)
                    .set({ IS_VERIFIED: 1 })
                    .where('USER_PK = :userPK', { userPK: result1.USER_PK });

                queryRunner.commitTransaction();
                res.send(true);
            } catch (err) {
                queryRunner.rollbackTransaction();
                res.send(false);
            } finally {
                queryRunner.release();
            }
        })();
    }
    login(data: Pick<any, 'NICKNAME' | 'PASSWORD'>, res: Response<any, Record<string, any>>): void {
        throw new Error('Method not implemented.');
    }
    logout(res: Response<any, Record<string, any>>): void {
        res.cookie('TOKEN', null);
    }
    findNickname(email: string, res: Response<any, Record<string, any>>): void {
        throw new Error('Method not implemented.');
    }
    requestResetPassword(email: string, res: Response<any, Record<string, any>>): void {
        throw new Error('Method not implemented.');
    }
    resetPassword(uuid: string, password: string, res: Response<any, Record<string, any>>): void {
        throw new Error('Method not implemented.');
    }
    generateLoginToken(userData: SelectData): string {
        throw new Error('Method not implemented.');
    }
    getUser(userPK: number, TOKEN: string, res: Response<any, Record<string, any>>): void {
        throw new Error('Method not implemented.');
    }
    checkDuplicateNickname(nickname: string, res: Response<any, Record<string, any>>): void {
        const result = this.userRepo.count({ NICKNAME: nickname });
        result.then((count) => {
            res.send(count);
        });
    }
}
