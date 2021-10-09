import { SocketTable, UserInfo } from '../../database/tablesInterface';
import { Server } from 'http';
import { RedisClient } from 'redis';

export interface ISocketService {
    findSocketId(userId: number): Promise<UserInfo[]>;
    addSocketId(userId: number, socketId: string): Promise<UserInfo>;
    findUserId(socketId: string): Promise<number>;
    socketConnections(server: Server, client: RedisClient): void;
}

export interface IMessage {
    sendTo: number;
    from: number;
    message: string;
    sendTime: number;
}
export interface IConnection {
    userId: number;
}
export interface IChatBox {
    messageLog: {
        [from: number]: IMessage[];
    };
}
// extended user information for chat log
export type ExtendedUserInfo = UserInfo & IChatBox & IStatus;

export interface IStatus {
    status: EStatus;
}

// enums
export enum EStatus {
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    BUSY = 'BUSY',
    OUT_OF_OFFICE = 'OUT_OF_OFFICE',
}
