export enum privateChatPath {
    HANDLE_CONNECTION = 'handleConnection',
    HANDLE_DISCONNECT = 'handleDisconnect',
    CLIENT_CONNECTED = 'client/connected',
    CLIENT_ERROR = 'client/error',
    CLIENT_SEND = 'client/send',
    CLIENT_RECEIVE_CHAT_LOG = 'client/receive-chatlog',
    SERVER_SEND = 'server/send',
    SERVER_CALL_CHAT_LOG = 'server/call-chatLog',
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

export interface IMessagePayload {
    roomId: string;
    sender: number;
    receiver: number;
    file?: number;
    message: string;
    date: number;
}
