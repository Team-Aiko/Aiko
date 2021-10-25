import { Grant } from 'src/entity';

export interface IUserPayload {
    USER_PK: number;
    NICKNAME: string;
    COMPANY_PK: number;
    DEPARTMENT_PK: number;
    COUNTRY_PK: number;
    grants: Grant[];
}
