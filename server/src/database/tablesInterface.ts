export interface userTable {
    USER_PK: number;
    NICKNAME: string;
    FIRST_NAME: string;
    LAST_NAME: string;
    EMAIL: string;
    TEL: string;
    COUNTRY: string;
    CREATE_DATE: number;
    IS_DELETED: number;
    COMPANY_PK: number;
    DEPARTMENT_PK: number;
    PROFILE_FILE_NAME: string;
}

export interface CompanyTable {
    COMPANY_PK: number;
    COMPANY_NAME: string;
    CREATE_DATE: number;
}
