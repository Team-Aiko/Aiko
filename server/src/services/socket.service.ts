import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';
import { UserInfo } from '../interfaces';
import { SocketRepository, UserRepository, OTOChatRoomRepository } from 'src/mapper';
import { getRepo } from 'src/Helpers/functions';

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
    /**
     * 회원가입 승인이 떨어질 시, 사원간 챗룸 생성.
     * @param userInfo
     * @returns
     */
    async makeOneToOneChatRooms(userInfo: UserInfo): Promise<boolean> {
        const { COMPANY_PK, USER_PK } = userInfo;
        const userList = await getRepo(UserRepository).getMembers(COMPANY_PK);
        return await getRepo(OTOChatRoomRepository).makeOneToOneChatRooms(USER_PK, userList, COMPANY_PK);
    }

    async getOneToOneChatRoomList(userId: number, companyPK: number) {
        await getRepo(OTOChatRoomRepository).getOneToOneChatRoomList(userId, companyPK);
    }
}
