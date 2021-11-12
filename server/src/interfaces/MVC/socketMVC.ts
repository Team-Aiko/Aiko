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
