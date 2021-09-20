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
