import { PrimaryGeneratedColumn, Column, Entity, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'GROUP_CHAT_STORAGE_TABLE' })
export default class GroupChatStorage {
    @PrimaryGeneratedColumn()
    GCS_PK: number;

    @Column()
    CF_PK: number;
    @Column()
    GC_PK: number;
    @Column()
    SENDER: number;
    @Column()
    MESSAGE: string;
    @Column()
    DATE: number;
}
