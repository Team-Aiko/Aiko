import { UserInfo } from '.';

export interface ISocketService {
    findSocketId(userId: number): Promise<string>;
    findUserId(socketId: string): Promise<number>;
    addSocketId(socketId: string, userInfo: UserInfo): boolean;
    removeSocketId(socketId: string): boolean;
    getMembers(companyPK: number): any;
}

export interface IOneToOnePacket {
    sendTo: {
        userPK: number;
        socketID: string;
    };
    fromTo: {
        userPK: number;
        socketID: string;
    };
    data: {
        msg: string;
        file: number; // CF_PK (database socket_table)
    };
}
