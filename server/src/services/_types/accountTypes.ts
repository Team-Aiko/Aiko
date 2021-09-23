import { UserTable, DepartmentTable, CompanyTable } from '../../database/tablesInterface';
import { Response } from 'express';

// * interfaces & Types
export interface HasherCallback {
    (err: any, pw: string, salt: string, hash: string): void;
}
export interface IHasher {
    (pwObj: { password: string; salt?: string }, callback: HasherCallback): void;
}

export interface BasePacket {
    header: boolean;
}

export interface IAccountService {
    checkDuplicateNickname(nickname: string, res: Response): void;
    checkDuplicateEmail(email: string, res: Response): void;
    getCountryList(str: string, res: Response): void;
    signup(data: ISignup, imageRoute: string | null, res: Response): any;
    grantLoginAuth(id: string, res: Response): void;
    login(data: Pick<UserTable, 'NICKNAME' | 'PASSWORD'>, res: Response): void;
    logout(res: Response): void;
    findNickname(email: string, res: Response): void;
    requestResetPassword(email: string, res: Response): void;
    resetPassword(uuid: string, password: string, res: Response): void;
    generateLoginToken(userData: SelectData): string;
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
export type SelectData = LoginSelectData & DepartmentSelectData & CompanySelectData;
export interface SuccessPacket extends BasePacket {
    userInfo: Omit<SelectData, 'PASSWORD' | 'SALT'>;
}
