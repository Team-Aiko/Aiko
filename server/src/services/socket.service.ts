import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';
import { SocketRepository, UserRepository, OTOChatRoomRepository } from 'src/mapper';
import { getRepo } from 'src/Helpers/functions';
import { User } from 'src/entity';
import { AikoError } from 'src/Helpers';
import { EntityManager, TransactionManager } from 'typeorm';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';
import { Socket, Server } from 'socket.io';
import {
    IOneToOnePacket,
    IRedisChatLog,
    StatusSocketContainer,
    StatusUserContainer,
} from 'src/interfaces/MVC/socketMVC';
import { statusPath } from '../interfaces/MVC/socketMVC';

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
     *
     *
     *
     *
     *
     *
     *     * rdbms - socket service
     *
     *
     *
     *
     *
     *
     */
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
     *
     *
     *
     *
     *
     *
     *     * 1:1 chat service
     *
     *
     *
     *
     *
     *
     */

    /**
     * 소켓 아이디 또는 유저 아이디를 redis로부터 조회하는 메소드 (1:1)
     * @param userId
     * @returns Promise<string | number> socketId or userPK
     */
    async findOtoUser(id: number | string) {
        try {
            return await this.getOtoUser(id);
        } catch (err) {
            throw new AikoError('testError', 451, 500000);
        }
    }

    async addSocketId(socketId: string, userInfo: User): Promise<boolean> {
        try {
            const userId = userInfo.USER_PK;
            return await this.setOtoUser(socketId, userId);
        } catch (err) {
            throw new AikoError('testError', 451, 500000);
        }
    }

    async addOtoChat(payload: IOneToOnePacket) {
        const { data, receiver, roomId, sender, companyPK } = payload;
        await this.appendChat(roomId, sender.USER_PK, receiver.USER_PK, companyPK, data);
    }

    /**
     *
     *
     *
     *
     *
     *
     *
     *
     * * status service
     *
     *
     *
     *
     *
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
                userStatus: !userContainer ? 1 : userContainer.userStatus,
            };
            const isSendable = !userContainer ? true : userContainer.logOutPending;

            await this.setUsrCont(COMPANY_PK, USER_PK, newUserContainer);
            await this.setSocketCont(socketId, COMPANY_PK, USER_PK);

            return { isSendable, user: isSendable ? user : undefined };
        } catch (err) {
            if (err instanceof AikoError) throw err;
            else throw new AikoError('socketService/statusConnection', 100, 1);
        }
    }

    /**
     * status disconnect를 시행하는 메소드, 5분의 유예기간을 줌
     * @param socketId
     */
    async statusDisconnect(socketClient: Socket, wss: Server) {
        console.log('socket/statusDisconnect start');

        try {
            const socketContainer = await this.getSocketCont(socketClient.id);
            if (socketContainer) {
                const userInfo = await getRepo(UserRepository).getUserInfoWithUserPK(socketContainer.userPK);
                const { COMPANY_PK, USER_PK } = userInfo;
                const userContainer = await this.getUsrCont(COMPANY_PK, USER_PK);

                setTimeout(async () => {
                    // delete process
                    console.log('delete process executed');
                    if (userContainer.logOutPending) {
                        await this.delUsrCont(COMPANY_PK, USER_PK);
                        await this.delSocketCont(socketClient.id);
                        wss.to(`${COMPANY_PK}`).except(socketClient.id).emit(statusPath.CLIENT_LOGOUT_ALERT, userInfo);
                    }
                }, 1000 * 60 * 5); // 5분간격

                await this.setUsrCont(COMPANY_PK, USER_PK, {
                    userPK: USER_PK,
                    socketId: socketClient.id,
                    logOutPending: true,
                    userStatus: userContainer.userStatus,
                });
            }
        } catch (err) {
            console.error(err);
            if (err instanceof AikoError) throw err;
            else throw new AikoError('socketService/statusDisconnect', 100, 2);
        }
    }

    /**
     * 로그인 시 status를 온라인으로 추가하는 메소드
     * @param user
     */
    async setOnline(user: User) {
        try {
            const { USER_PK, COMPANY_PK } = user;
            const newUserCont: StatusUserContainer = {
                userPK: user.USER_PK,
                logOutPending: false,
                userStatus: 1,
            };
            this.setUsrCont(COMPANY_PK, USER_PK, newUserCont);
        } catch (err) {
            console.error(err);
            if (err instanceof AikoError) throw err;
            else throw new AikoError('socketService/setOnline', 500, 500594);
        }
    }

    async changeStatus(socketId: string, userStatus: number) {
        try {
            const socketContainer = await this.getSocketCont(socketId);
            const { companyPK, userPK } = socketContainer;
            const userContainer = await this.getUsrCont(companyPK, userPK);
            userContainer.userStatus = userStatus;
            await this.setUsrCont(companyPK, userPK, userContainer);
            return { userPK, userStatus };
        } catch (err) {
            console.error(err);
            if (err instanceof AikoError) throw err;
        }
    }

    async getUserInfoStataus(socketId: string) {
        try {
            return await this.getSocketCont(socketId);
        } catch (err) {
            console.error(err);
            throw new AikoError('socketService/getUserInfoStataus', 0, 4);
        }
    }

    // TODO:후일 지워야함.
    async testSendMsg(text: string) {
        console.log(text);
    }
    /**
     *
     *
     *
     *
     *
     * * util functions (oto)
     *
     *
     *
     *
     */

    /**
     *
     * @param socketId
     * @param userPK
     * @returns
     */
    async setOtoUser(socketId: string, userPK: number) {
        let flag = false;

        try {
            client.hset(`oto/userSet1`, `${userPK}`, socketId);
            client.hset(`oto/userSet2`, socketId, `${userPK}`);
            flag = true;
        } catch (err) {
            console.error(err);
            throw new AikoError('socketService/setSocketUser', 500, 100478);
        }
        return flag;
    }

    async getOtoUser(id: number | string) {
        try {
            if (typeof id === 'number') {
                return await new Promise<string>((resolve, reject) => {
                    client.hget(`oto/userSet1`, `${id}`, (err, reply) => {
                        if (err) throw err;

                        resolve(reply);
                    });
                });
            }

            if (typeof id === 'string') {
                return await new Promise<number>((resolve, reject) => {
                    client.hget(`oto/userSet2`, id, (err, reply) => {
                        if (err) throw err;

                        resolve(Number(reply));
                    });
                });
            }
        } catch (err) {
            console.error(err);
            throw new AikoError('socketService/getSocketUser', 500, 100479);
        }
    }

    async delOtoUser(userPK: number, socketId: string) {
        let flag = false;

        try {
            client.hdel('oto/userSet1', `${userPK}`);
            client.hdel('oto/userSEt2', socketId);
            flag = true;
        } catch (err) {
            console.error(err);
            throw new AikoError('socketService/delOtoUser', 500, 192304);
        }

        return flag;
    }

    async appendChat(
        roomId: string,
        sender: number,
        receiver: number,
        companyPK: number,
        data: {
            msg: string;
            file: number;
            date: number;
        },
    ) {
        try {
            const chatLog = await this.callChatLog(roomId, companyPK);
            await this.updateChatLog(receiver, sender, companyPK, roomId, chatLog, data);
        } catch (err) {
            console.error(err);
        }
    }

    async callChatLog(roomId: string, companyPK: number) {
        return await new Promise<IRedisChatLog>((resolve, reject) => {
            client.hget(`oto/chatlog:${companyPK}`, roomId, (err, reply) => {
                let packet: IRedisChatLog;

                if (!reply) {
                    packet = {
                        chats: [],
                    };
                } else {
                    packet = JSON.parse(reply) as IRedisChatLog;
                }

                resolve(packet);
            });
        });
    }

    async updateChatLog(
        receiver: number,
        sender: number,
        companyPK: number,
        roomId: string,
        chatLog: IRedisChatLog,
        data: {
            msg: string;
            file: number;
            date: number;
        },
    ) {
        chatLog.chats.push({ receiver, sender, date: data.date, file: data.file, msg: data.msg });
        client.hset(`oto/chatlog:${companyPK}`, roomId, JSON.stringify(chatLog));
    }

    /**
     *
     *
     *
     *
     *
     *
     *
     *
     * * util functions (status)
     *
     *
     *
     *
     *
     *
     *
     */

    //
    async getUsrCont(COMPANY_PK: number, USER_PK: number) {
        try {
            return await new Promise<StatusUserContainer>((resolve, reject) => {
                client.hget('status/userCont', `${COMPANY_PK}:${USER_PK}`, (err, reply) => {
                    if (err) throw err;

                    resolve(JSON.parse(reply) as StatusUserContainer);
                });
            });
        } catch (err) {
            console.error(err);
            throw new AikoError('socketService/getUsrCont', 100, 5091282);
        }
    }

    async setUsrCont(COMPANY_PK: number, USER_PK: number, container: StatusUserContainer) {
        try {
            return client.hset('status/userCont', `${COMPANY_PK}:${USER_PK}`, JSON.stringify(container));
        } catch (err) {
            console.error(err);
            throw new AikoError('socketService/setUsrCont', 100, 5091282);
        }
    }

    async delUsrCont(COMPANY_PK: number, USER_PK: number) {
        try {
            client.hdel('status/userCont', `${COMPANY_PK}:${USER_PK}`);
        } catch (err) {
            console.error(err);
            throw new AikoError('socketService/delUsrCont', 100, 5091282);
        }
    }

    async setSocketCont(socketId: string, companyPK: number, userPK: number) {
        try {
            return client.hset('status/socketCont', socketId, JSON.stringify({ companyPK, userPK }));
        } catch (err) {
            console.error(err);
            throw new AikoError('socketService/setSocketCont', 100, 5091282);
        }
    }

    async getSocketCont(socketId: string) {
        try {
            return await new Promise<StatusSocketContainer>((resolve, rejects) => {
                client.hget('status/socketCont', socketId, (err, reply) => {
                    if (err) throw err;

                    resolve(JSON.parse(reply) as StatusSocketContainer);
                });
            });
        } catch (err) {
            console.error(err);
            throw new AikoError('socketService/getSocketCont', 100, 5091282);
        }
    }

    async delSocketCont(socketId: string) {
        try {
            client.hdel('status/socketCont', socketId);
        } catch (err) {
            console.error(err);
            throw new AikoError('socketService/delSocketCont', 100, 5091282);
        }
    }
}
