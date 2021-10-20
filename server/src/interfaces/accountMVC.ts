/* eslint-disable no-unused-vars */
import { UserTable, DepartmentTable, CompanyTable } from '.';
import { Response, Request } from 'express';
import { UserRepository } from '../entity';

// * interfaces & Types

export interface BasePacket {
    header: boolean;
}

export interface IAccountController {
    checkDuplicateNickname(req: Request, res: Response): void;
    checkDuplicateEmail(req: Request, res: Response): void;
    getCountryList(req: Request, res: Response): void;
    signup(req: Request, file: Express.Multer.File, res: Response): void;
    grantLoginAuth(req: Request, res: Response): void;
    login(req: Request, res: Response): void;
    logout(req: Request, res: Response): void;
    findNickname(req: Request, res: Response): void;
    requestResetPassword(req: Request, res: Response): void;
    resetPassword(req: Request, res: Response): void;
}

export interface IAccountService {
    checkDuplicateNickname(nickname: string, res: Response): void;
    checkDuplicateEmail(email: string, res: Response);
    getCountryList(str: string, res: Response): void;
    signup(data: ISignup, imageRoute: string | null, res: Response): any;
    grantLoginAuth(id: string, res: Response): void;
    login(data: Pick<UserTable, 'NICKNAME' | 'PASSWORD'>, res: Response): void;
    logout(res: Response): void;
    findNickname(email: string, res: Response): void;
    requestResetPassword(email: string, res: Response): void;
    resetPassword(uuid: string, password: string, res: Response): void;
    generateLoginToken(userData: UserRepository): string;
    getUser(userPK: number, TOKEN: string, res: Response): void;
}

export interface ISignup {
    header: number;
    firstName: string;
    lastName: string;
    nickname: string;
    email: string;
    tel: string;
    countryPK: number;
    pw: string;
    position: number;
    companyPK: number;
    companyName: string | undefined;
}

export interface IResetPw {
    uuid: string;
    password: string;
}

export type LoginSelectData = Pick<
    UserTable,
    'USER_PK' | 'NICKNAME' | 'PASSWORD' | 'SALT' | 'COMPANY_PK' | 'DEPARTMENT_PK' | 'EMAIL'
>;
export type DepartmentSelectData = Pick<DepartmentTable, 'DEPARTMENT_NAME'>;
export type CompanySelectData = Pick<CompanyTable, 'COMPANY_NAME'>;
export type UserInfo = Omit<UserTable, 'PASSWORD' | 'SALT'>;
export interface SuccessPacket extends BasePacket {
    userInfo: UserInfo;
}
