import { Grant } from 'src/entity';

export interface IMeetingRoomBundle {
    isOnline: boolean;
    roomName: string;
    locate: string;
    grants: Grant[];
    companyPK: number;
}
