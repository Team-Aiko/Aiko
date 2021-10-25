import { PrimaryColumn, Column, Entity } from 'typeorm';

@Entity({ name: 'REFRESH_TOKEN_TABLE' })
export default class Refresh {
    @PrimaryColumn()
    NO: number;
    @Column()
    USER_PK: number;
    @Column()
    USER_TOKEN: string;
}
