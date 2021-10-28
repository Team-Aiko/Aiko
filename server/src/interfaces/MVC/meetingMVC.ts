import { Grant } from 'src/entity';

export interface IMeetingRoomBundle {
    ROOM_PK?: number;
    IS_ONLINE: boolean;
    ROOM_NAME: string;
    LOCATE: string;
    grants: Grant[];
    COMPANY_PK: number;
}
