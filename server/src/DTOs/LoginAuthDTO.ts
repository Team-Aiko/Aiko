import { LoginAuthTable } from '../interfaces';

export default class LoginAuthDTO implements LoginAuthTable {
    LOGIN_AUTH_PK: number;
    USER_PK: number;
    UUID: string;

    set userPK(userPK: number) {
        this.USER_PK = userPK;
    }

    set uuid(uuid: string) {
        this.UUID = uuid;
    }
}
