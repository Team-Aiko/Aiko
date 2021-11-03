import { User } from 'src/entity';

export interface IOneToOnePacket {
    sender: Pick<User, 'USER_PK' | 'USER_PROFILE_PK' | 'FIRST_NAME' | 'LAST_NAME'>;
    receiver: Pick<User, 'USER_PK' | 'USER_PROFILE_PK' | 'FIRST_NAME' | 'LAST_NAME'>;
    companyPK: number;
    roomId: string;
    data: {
        msg: string;
        file: number; // CF_PK (database socket_table)
        date: number;
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

export interface IRedisChatLog {
    chats: {
        sender: number;
        receiver: number;
        msg: string;
        file: number;
        date: number;
    }[];
}

export enum otoPath {
    HANDLE_CONNECTION = 'handleConnection',
    HANDLE_DISCONNECT = 'handleDisconnect',
    CLIENT_USERINFO_BROADCAST = 'client/userInfo-broadcast',
    CLIENT_CONNECTED = 'client/connected',
    CLIENT_ERROR = 'client/error',
    CLIENT_SEND = 'client/send',
    CLIENT_RECEIVE_CHAT_LOG = 'client/receiveChatLog',
    SERVER_SEND = 'server/send',
    SERVER_CALL_CHAT_LOG = 'server/callChatLog',
}

export enum statusPath {
    HANDLE_CONNECTION = 'handleConnection',
    HANDLE_DISCONNECT = 'handleDisconnect',
    SERVER_CHANGE_STATUS = 'server/status/changeStatus',
    CLIENT_CHANGE_STATUS = 'client/status/changeStatus',
    CLIENT_ERROR = 'client/status/error',
    CLIENT_LOGIN_ALERT = 'client/status/loginAlert',
    CLIENT_LOGOUT_ALERT = 'client/status/logoutAlert',
}
