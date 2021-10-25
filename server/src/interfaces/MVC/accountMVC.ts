/* eslint-disable no-unused-vars */
import { UserTable, DepartmentTable, CompanyTable } from '../DBTables';
import { User } from '../../entity';

// * interfaces & Types

export interface BasePacket {
    header: boolean;
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
    companyPK?: number;
    companyName?: string;
    departmentPK?: number;
    userPK?: number;
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
export interface SuccessPacket extends BasePacket {
    userInfo: User;
    accessToken: string;
    refreshToken: string;
}

export interface ITokenBundle {
    header: boolean;
    accessToken?: string;
    refreshToken?: string;
}
