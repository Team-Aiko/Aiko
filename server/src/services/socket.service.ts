import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';
import { SocketRepository, UserRepository, OTOChatRoomRepository } from 'src/mapper';
import { getRepo } from 'src/Helpers/functions';
import { Socket as SocketEntity, User } from 'src/entity';
import { propsRemover, AikoError } from 'src/Helpers';
import { EntityManager, TransactionManager } from 'typeorm';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';
import { Socket, Server } from 'socket.io';
import { StatusSocketContainer, StatusUserContainer } from 'src/interfaces/MVC/socketMVC';

/**
 * Redis data structure
 * ! [ket1 - key2 - value]
 * 'status/userCont' - 'companyPK:userPK' - StatusUserContainer (회사아이디와 유저아이디로 연결상태 출력)
 * 'status/socketCont' - 'socketId' - StatusSocketContainer (소켓 아이디로 회사아이디, 유저아이디 출력)
 */

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
            throw new AikoError('testError', 451, 500000);
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
            throw new AikoError('testError', 451, 500000);
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
            throw new AikoError('testError', 451, 500000);
        }
    }

    async findUserId(socketId: string): Promise<number> {
        try {
            return await getRepo(SocketRepository).findUserId(socketId);
        } catch (err) {
            throw new AikoError('testError', 451, 500000);
        }
    }

    async addSocketId(socketId: string, userInfo: User): Promise<boolean> {
        try {
            const userId = userInfo.USER_PK;
            return await getRepo(SocketRepository).addSocketId(userId, socketId);
        } catch (err) {
            throw new AikoError('testError', 451, 500000);
        }
    }
    /**
     * 회원가입 승인이 떨어질 시, 사원간 챗룸 생성.
     * @param userInfo
     * @returns
     */
    async makeOneToOneChatRooms(
        @TransactionManager() manager: EntityManager,
        companyPK: number,
        userPK: number,
    ): Promise<boolean> {
        try {
            const userList = await getRepo(UserRepository).getMembers(companyPK);
            return await getRepo(OTOChatRoomRepository).makeOneToOneChatRooms(manager, userPK, userList, companyPK);
        } catch (err) {
            throw new AikoError('testError', 451, 500000);
        }
    }

    async getOneToOneChatRoomList(userId: number, companyPK: number) {
        try {
            return await getRepo(OTOChatRoomRepository).getOneToOneChatRoomList(userId, companyPK);
        } catch (err) {
            throw new AikoError('testError', 451, 500000);
        }
    }

    /**
     *
     *
     *
     * up: 1:1 chat service
     *
     *
     *
     *
     * divide lines
     *
     *
     *
     * down: status service
     *
     *
     */

    /**
     * status connection 실시메소드, setOnline과 별개로 필요한 과정.
     * @param socketId
     * @param userPayload
     * @returns
     */
    async statusConnection(socketId: string, userPayload: IUserPayload): Promise<{ isSendable: boolean; user?: User }> {
        const { USER_PK, COMPANY_PK } = userPayload;

        try {
            const userContainer = await this.getUsrCont(COMPANY_PK, USER_PK);
            const user = await getRepo(UserRepository).getUserInfoWithUserPK(userPayload.USER_PK);
            const newUserContainer: StatusUserContainer = {
                userPK: USER_PK,
                logOutPending: false,
                socketId: socketId,
            };
            let isSendable = false;

            if (!userContainer) {
                await this.setUsrCont(COMPANY_PK, USER_PK, newUserContainer);
                isSendable = true;
            } else {
                if (userContainer.timeoutId) clearTimeout(userContainer.timeoutId);
                await this.setUsrCont(COMPANY_PK, USER_PK, newUserContainer);
                isSendable = !userContainer.logOutPending;
            }

            return { isSendable, user: isSendable ? user : undefined };
        } catch (err) {
            throw err;
        }
    }

    /**
     * status disconnect를 시행하는 메소드, 5분의 유예기간을 줌
     * @param socketId
     */
    async statusDisconnect(socketClient: Socket, wss: Server) {
        console.log('socket/statusDisconnect start');

        const socketContainer = await this.getSocketCont(socketClient.id);
        const userInfo = await getRepo(UserRepository).getUserInfoWithUserPK(socketContainer.userPK);
        const { COMPANY_PK, USER_PK } = userInfo;

        const timeoutId = setTimeout(async () => {
            // delete process
            await this.delUsrCont(COMPANY_PK, USER_PK);
            await this.delSocketCont(socketClient.id);
            socketClient.emit('client/status/logoutAlert', 'success disconnect process');
            wss.to(`${COMPANY_PK}`).except(socketClient.id).emit('client/status/logoutAlert', userInfo);
        }, 1000 * 5);

        await this.setUsrCont(COMPANY_PK, USER_PK, {
            userPK: USER_PK,
            socketId: socketClient.id,
            timeoutId,
            logOutPending: true,
        });
    }

    /**
     * 로그인 시 status를 온라인으로 추가하는 메소드
     * @param user
     */
    async setOnline(user: User) {
        const { USER_PK, COMPANY_PK } = user;
        const newUserCont: StatusUserContainer = {
            userPK: user.USER_PK,
            logOutPending: false,
        };
        const reply = await this.getUsrCont(COMPANY_PK, USER_PK);

        // 로그인 유저가 전혀 없는 경우
        if (!reply) this.setUsrCont(COMPANY_PK, USER_PK, newUserCont);
        else {
            // 로그인 유저가 존재하는 경우
            if (reply.timeoutId) clearTimeout(reply.timeoutId);
            this.setUsrCont(COMPANY_PK, USER_PK, newUserCont);
        }
    }

    // TODO:후일 지워야함.
    async testSendMsg(text: string) {
        console.log(text);
    }

    // * util functions
    async getUsrCont(COMPANY_PK: number, USER_PK: number) {
        return await new Promise<StatusUserContainer>((resolve, reject) => {
            client.hget('status/userCont', `${COMPANY_PK}:${USER_PK}`, (err, reply) => {
                if (err) throw err;

                resolve(JSON.parse(reply) as StatusUserContainer);
            });
        });
    }

    async setUsrCont(COMPANY_PK: number, USER_PK: number, container: StatusUserContainer) {
        return client.hset('status/userCont', `${COMPANY_PK}:${USER_PK}`, JSON.stringify(container));
    }

    async delUsrCont(COMPANY_PK: number, USER_PK: number) {
        client.hdel('status/userCont', `${COMPANY_PK}:${USER_PK}`);
    }

    async setSocketCont(socketId: string, companyPK: number, userPK: number) {
        // 'companyList' - 'socketId' - 'companyPK'

        return client.hset('status/socketCont', socketId, JSON.stringify({ companyPK, userPK }));
    }

    async getSocketCont(socketId: string) {
        return await new Promise<StatusSocketContainer>((resolve, rejects) => {
            client.hget('status/socketCont', socketId, (err, reply) => {
                if (err) throw err;

                resolve(JSON.parse(reply) as StatusSocketContainer);
            });
        });
    }

    async delSocketCont(socketId: string) {
        client.hdel('status/socketCont', socketId);
    }
}
