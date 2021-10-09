import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { RowDataPacket } from 'mysql2';
import { conn, pool } from '../database';
import { IAccountService, ISignup, SelectData } from '../interfaces/accountTypes';

@Injectable()
export default class AccountService implements IAccountService {
    checkDuplicateEmail(email: string, res: Response<any, Record<string, any>>): void {
        throw new Error('Method not implemented.');
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
