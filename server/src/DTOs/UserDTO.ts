import { UserTable } from '../interfaces';

export default class UserDTO implements UserTable {
    COUNTRY_PK: number;
    USER_PK: number;
    NICKNAME: string;
    PASSWORD: string;
    SALT: string;
    FIRST_NAME: string;
    LAST_NAME: string;
    EMAIL: string;
    TEL: string;
    CREATE_DATE: number;
    IS_DELETED: number;
    IS_VERIFIED: number;
    COMPANY_PK: number;
    DEPARTMENT_PK: number;
    PROFILE_FILE_NAME: string;

    set email(email: string) {
        this.EMAIL = email;
    }

    set password(pw: string) {
        this.PASSWORD = pw;
    }

    set nickname(nickname: string) {
        this.NICKNAME = nickname;
    }
}
