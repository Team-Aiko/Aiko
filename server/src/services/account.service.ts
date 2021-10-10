import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { UserRepository } from '../entity';
import { IAccountService, ISignup, SelectData } from '../interfaces/accountTypes';

@Injectable()
export default class AccountService implements IAccountService {
    constructor(
        @InjectRepository(UserRepository)
        private userRepo: Repository<UserRepository>,
    ) {}

    checkDuplicateEmail(email: string, res: Response<any, Record<string, any>>): void {
        const result = this.userRepo.findOne({ EMAIL: email });
        res.send(result);
    }
    getCountryList(str: string, res: Response<any, Record<string, any>>): void {
        throw new Error('Method not implemented.');
    }
    signup(data: ISignup, imageRoute: string, res: Response<any, Record<string, any>>) {
        throw new Error('Method not implemented.');
    }
    grantLoginAuth(id: string, res: Response<any, Record<string, any>>): void {
        throw new Error('Method not implemented.');
    }
    login(data: Pick<any, 'NICKNAME' | 'PASSWORD'>, res: Response<any, Record<string, any>>): void {
        throw new Error('Method not implemented.');
    }
    logout(res: Response<any, Record<string, any>>): void {
        throw new Error('Method not implemented.');
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
        throw new Error('Method not implemented.');
    }
}
