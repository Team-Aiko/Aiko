export enum privateChatPath {
    HANDLE_CONNECTION = 'handleConnection',
    HANDLE_DISCONNECT = 'handleDisconnect',
    CLIENT_CONNECTED = 'client/private-chat/connected',
    CLIENT_ERROR = 'client/private-chat/error',
    CLIENT_SEND = 'client/private-chat/send',
    CLIENT_RECEIVE_CHAT_LOG = 'client/private-chat/receive-chatlog',
    SERVER_SEND = 'server/private-chat/send',
    SERVER_CALL_CHAT_LOG = 'server/private-chat/call-chatLog',
}

export enum statusPath {
    HANDLE_CONNECTION = 'handleConnection',
    HANDLE_DISCONNECT = 'handleDisconnect',
    SERVER_CHANGE_STATUS = 'server/status/changeStatus',
    CLIENT_GET_STATUS_LIST = 'client/status/getStatusList',
    CLIENT_CHANGE_STATUS = 'client/status/changeStatus',
    CLIENT_ERROR = 'client/status/error',
    CLIENT_LOGIN_ALERT = 'client/status/loginAlert',
    CLIENT_LOGOUT_ALERT = 'client/status/logoutAlert',
}

export enum groupChatPath {
    HANDLE_CONNECTION = 'handleConnection',
    HANDLE_DISCONNECT = 'handleDisconnect',
    CREATE_GROUP_CHAT_ROOM = 'create-group-chat-room',
    CLIENT_CONNECTED = 'client/gc/connected',
    CLIENT_JOIN_ROOM_NOTICE = 'client/gc/join-room-notice',
    CLIENT_JOINED_GCR = 'client/gc/joined_gcr',
    CLIENT_READ_CHAT_LOGS = 'client/gc/read-chat-logs',
    CLIENT_SEND_MESSAGE = 'client/gc/send-message',
    CLIENT_ERROR_ALERT = 'client/gc/errorAlert',
    SERVER_JOIN_GROUP_CHAT_ROOM = 'server/gc/join-group-chat-room',
    SERVER_SEND_MESSAGE = 'server/gc/send-message',
    SERVER_READ_CHAT_LOGS = 'server/gc/read-chat-logs',
    TEST_ADD_NEW_CLIENT = 'test/gc/add-new-client',
}

export interface IMessagePayload {
    roomId: string;
    sender: number;
    file?: number;
    message: string;
    date: number;
}

export interface IGMessagePayload {
    GC_PK: number;
    sender: number;
    message: string;
    file?: number;
    date: number;
}
