import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';
import { ISocketService, UserInfo } from '../interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { Socket, User } from '../entity';
import { SocketRepository, UserRepository } from 'src/mapper';
import { getRepo } from 'src/Helpers/functions';

const client = createClient();
setInterval(() => {
    // redis save process...
    client.bgsave();
}, 1000 * 60 * 60 * 24);

@Injectable()
export default class SocketService implements ISocketService {
    /**
     * socket_table로부터 특정 유저를 삭제.
     * @param userId
     * @returns boolean (성공여부)
     */
    async removeSocketId(socketId: string): Promise<boolean> {
        return await getRepo(SocketRepository).removeSocketId(socketId);
    }

    /**
     * companyPK를 이용해 동일한 회사소속의 사원의 리스트를 얻어내는 메소드 (소켓용)
     * @param companyPK
     * @returns UserRepository[]
     */
    async getMembers(companyPK: number) {
        return await getRepo(UserRepository).getMembers(companyPK);
    }

    /**
     * 소켓 아이디를 rdbms로부터 조회하는 메소드
     * @param userId
     * @returns Promise<string> socketId
     */
    async findSocketId(userId: number): Promise<string> {
        return await getRepo(SocketRepository).findSocketId(userId);
    }

    async findUserId(socketId: string): Promise<number> {
        return await getRepo(SocketRepository).findUserId(socketId);
    }

    async addSocketId(socketId: string, userInfo: UserInfo): Promise<boolean> {
        const userId = userInfo.USER_PK;
        return await getRepo(SocketRepository).addSocketId(userId, socketId);
    }
}
