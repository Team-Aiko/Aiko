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

export interface ChatFileTable {
    CF_PK: number;
    ORIGINAL_NAME: string;
    FILE_NAME: string;
    CR_PK: string;
}

export interface OneToOneChatRoomTable {
    CR_PK: string;
    USER_1: number;
    USER_2: number;
}

export interface AuthListTable {
    AUTH_LIST_PK: number;
    AUTH_NAME: string;
}

export interface RefreshTokenTable {
    NO: number;
    USER_PK: number;
    USER_TOKEN: string;
}

export interface GrantTable {
    GRNT_PK: number;
    USER_PK: number;
    AUTH_LIST_PK: number;
}

export interface UserProfileFileTable {
    USER_PROFILE_PK: number;
    ORIGINAL_NAME: string;
    FILE_NAME: string;
}
