export interface UserTable {
    USER_PK: number;
    NICKNAME: string;
    PASSWORD: string;
    SALT: string;
    FIRST_NAME: string;
    LAST_NAME: string;
    EMAIL: string;
    TEL: string;
    COUNTRY_PK: number;
    CREATE_DATE: number;
    IS_DELETED: number;
    IS_VERIFIED: number;
    COMPANY_PK: number;
    DEPARTMENT_PK: number;
    PROFILE_FILE_NAME: string;
}

export interface CompanyTable {
    COMPANY_PK: number;
    COMPANY_NAME: string;
    CREATE_DATE: number;
}

export interface CountryTable {
    COUNTRY_PK: number;
    COUNTRY_NAME: string;
}

export interface LoginAuthTable {
    LOGIN_AUTH_PK: number;
    USER_PK: number;
    UUID: string;
}

export interface DepartmentTable {
    DEPARTMENT_PK: number;
    DEPARTMENT_NAME: string;
    COMPANY_PK: number;
    PARENT_PK: number;
    DEPTH: number;
}

export interface ResetPwTable {
    RESET_PK: number;
    USER_PK: number;
    UUID: string;
}

export interface SocketTable {
    SOCKET_PK: number;
    SOCKET_ID: string;
    USER_PK: number;
}

export type UserInfo = Pick<SocketTable, 'SOCKET_ID' | 'USER_PK'> &
    Pick<UserTable, 'FIRST_NAME' | 'LAST_NAME' | 'NICKNAME' | 'COMPANY_PK' | 'DEPARTMENT_PK' | 'PROFILE_FILE_NAME'>;
