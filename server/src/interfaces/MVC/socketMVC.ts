import { User } from 'src/entity';

export interface IOneToOnePacket {
    sender: Pick<User, 'USER_PK' | 'PROFILE_FILE_NAME' | 'FIRST_NAME' | 'LAST_NAME'>;
    receiver: Pick<User, 'USER_PK' | 'PROFILE_FILE_NAME' | 'FIRST_NAME' | 'LAST_NAME'>;
    roomId: string;
    data: {
        msg: string;
        file: number; // CF_PK (database socket_table)
    };
}
