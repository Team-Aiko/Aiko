import { PrimaryColumn, Column, Entity } from 'typeorm';
import { OneToOneChatRoomTable } from 'src/interfaces';

@Entity({ name: 'ONE_TO_ONE_CHAT_ROOM_TABLE' })
export default class OTOChatRoom implements OneToOneChatRoomTable {
    @PrimaryColumn()
    CR_PK: string;
    @Column()
    USER_1: number;
    @Column()
    USER_2: number;
    @Column()
    COMPANY_PK: number;
}
