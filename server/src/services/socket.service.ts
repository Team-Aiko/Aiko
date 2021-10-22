import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';
import { SocketRepository, UserRepository, OTOChatRoomRepository } from 'src/mapper';
import { getRepo } from 'src/Helpers/functions';
import { User } from 'src/entity';

const client = createClient();
setInterval(() => {
    // redis save process...
    client.bgsave();
}, 1000 * 60 * 60 * 24);

@Injectable()
export default class SocketService {
    /**
     * socket_table로부터 특정 유저를 삭제.
     * @param userId
     * @returns boolean (성공여부)
     */
    async removeSocketId(socketId: string): Promise<boolean> {
        try {
            return await getRepo(SocketRepository).removeSocketId(socketId);
        } catch (err) {
            throw err;
        }
    }

    /**
     * companyPK를 이용해 동일한 회사소속의 사원의 리스트를 얻어내는 메소드 (소켓용)
     * @param companyPK
     * @returns UserRepository[]
     */
    async getMembers(companyPK: number) {
        try {
            return await getRepo(UserRepository).getMembers(companyPK);
        } catch (err) {
            throw err;
        }
    }

    /**
     * 소켓 아이디를 rdbms로부터 조회하는 메소드
     * @param userId
     * @returns Promise<string> socketId
     */
    async findSocketId(userId: number): Promise<string> {
        try {
            return await getRepo(SocketRepository).findSocketId(userId);
        } catch (err) {
            throw err;
        }
    }

    async findUserId(socketId: string): Promise<number> {
        try {
            return await getRepo(SocketRepository).findUserId(socketId);
        } catch (err) {
            throw err;
        }
    }

    async addSocketId(socketId: string, userInfo: User): Promise<boolean> {
        try {
            const userId = userInfo.USER_PK;
            return await getRepo(SocketRepository).addSocketId(userId, socketId);
        } catch (err) {
            throw err;
        }
    }
    /**
     * 회원가입 승인이 떨어질 시, 사원간 챗룸 생성.
     * @param userInfo
     * @returns
     */
    async makeOneToOneChatRooms(userInfo: User): Promise<boolean> {
        try {
            const { COMPANY_PK, USER_PK } = userInfo;
            const userList = await getRepo(UserRepository).getMembers(COMPANY_PK);
            return await getRepo(OTOChatRoomRepository).makeOneToOneChatRooms(USER_PK, userList, COMPANY_PK);
        } catch (err) {
            throw err;
        }
    }

    async getOneToOneChatRoomList(userId: number, companyPK: number) {
        try {
            await getRepo(OTOChatRoomRepository).getOneToOneChatRoomList(userId, companyPK);
        } catch (err) {
            throw err;
        }
    }
}
