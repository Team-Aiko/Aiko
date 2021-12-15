import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity({ name: 'CHATLOG_STORAGE_TABLE' })
export default class ChatLogStorage {
    @PrimaryGeneratedColumn()
    CS_PK: number;

    @Column()
    CR_PK: string;

    @Column()
    SENDER: number;

    @Column()
    CF_PK: number;

    @Column()
    MESSAGE: string;
}
