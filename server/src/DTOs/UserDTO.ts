import { UserRepository } from '../entity';

export default class UserDTO extends UserRepository {
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
