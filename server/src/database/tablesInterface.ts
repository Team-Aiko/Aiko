export interface UserTable {
    USER_PK: number;
    NICKNAME: string;
    PASSWORD: string;
    SALT: string;
    FIRST_NAME: string;
    LAST_NAME: string;
    EMAIL: string;
    TEL: string;
    COUNTRY: string;
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
