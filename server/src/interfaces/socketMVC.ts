import { UserInfo } from '.';

export interface ISocketService {
    findSocketId(userId: number): Promise<string>;
    findUserId(socketId: string): Promise<number>;
    addSocketId(socketId: string, userInfo: UserInfo): boolean;
    removeSocketId(socketId: string): boolean;
    getMembers(companyPK: number): any;
}
