import { ResetPwTable } from '../interfaces';

export default class ResetPwDTO implements ResetPwTable {
    RESET_PK: number;
    USER_PK: number;
    UUID: string;

    set uuid(uuid: string) {
        this.UUID = uuid;
    }
    set userPK(userPK: number) {
        this.USER_PK = userPK;
    }
}
