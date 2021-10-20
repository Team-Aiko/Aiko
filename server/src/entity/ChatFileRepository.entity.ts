import { ChatFileTable } from 'src/interfaces';
import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';
import { UserRepository } from '.';

@Entity({ name: 'CHAT_FILE_TABLE' })
export default class ChatFileRepository implements ChatFileTable {
    @PrimaryGeneratedColumn()
    CF_PK: number;
    @Column()
    SENDER: number;
    @Column()
    RECEIVER: number;
    @Column()
    FILE_ROOT: string;
}
