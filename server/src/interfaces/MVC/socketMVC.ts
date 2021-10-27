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

export interface StatusUserContainer {
    socketId?: string;
    userPK: number;
    logOutPending: boolean;
    userStatus: number;
}

export interface StatusSocketContainer {
    userPK: number;
    companyPK: number;
}

export enum statusPath {
    HANDLE_CONNECTION = 'handleConnection',
    HANDLE_DISCONNECT = 'handleDisconnect',
    SERVER_CHANGE_STATUS = 'server/status/changeStatus',
    CLIENT_USERLIST = 'client/status/userList',
    CLIENT_CHANGE_STATUS = 'client/status/changeStatus',
    CLIENT_ERROR = 'client/status/error',
    CLIENT_LOGIN_ALERT = 'client/status/loginAlert',
    CLIENT_LOGOUT_ALERT = 'client/status/logoutAlert',
}
