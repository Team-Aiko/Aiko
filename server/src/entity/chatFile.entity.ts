import { ChatFileTable } from 'src/interfaces';
import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';
import { User } from '.';

@Entity({ name: 'CHAT_FILE_TABLE' })
export default class ChatFile implements ChatFileTable {
    @PrimaryGeneratedColumn()
    CF_PK: number;
    @Column()
    SENDER: number;
    @Column()
    RECEIVER: number;
    @Column()
    FILE_ROOT: string;
}
