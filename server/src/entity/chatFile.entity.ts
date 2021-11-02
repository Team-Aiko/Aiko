import { ChatFileTable } from 'src/interfaces';
import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';
import { User } from '.';

@Entity({ name: 'CHAT_FILE_TABLE' })
export default class ChatFile implements ChatFileTable {
    @PrimaryGeneratedColumn()
    CF_PK: number;
    @Column()
    ORIGINAL_NAME: string;
    @Column()
    FILE_NAME: string;
    @Column()
    FILE_SIZE: number;
    @Column()
    CR_PK: string;
}
