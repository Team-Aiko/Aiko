import { SocketTable, UserInfo } from '../../database/tablesInterface';

export interface ISocketService {
    findSocketId(userId: number): Promise<UserInfo[]>;
    addSocketId(userId: number, socketId: string): Promise<UserInfo>;
}
