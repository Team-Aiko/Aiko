import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';
import { SocketRepository, UserRepository, OTOChatRoomRepository } from 'src/mapper';
import { getRepo } from 'src/Helpers/functions';
import { Socket as SocketEntity, User } from 'src/entity';
import { AikoError } from 'src/Helpers/classes';
import { EntityManager, TransactionManager } from 'typeorm';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';
import { Socket } from 'socket.io';

// 'statusCompanyContainer' - 'companyPK-UserPK' - UserStatusContainer
// 'statusSocketContainer' - 'socketId' - '{ userPK: number; companyPK: number }'
interface CompanyContainer {
    userList: { socketId?: string; userPK: number; intervalId?: NodeJS.Timeout; logOutPending: boolean }[];
}

interface StatusSocketContainer {
    userPK: number;
    companyPK: number;
}

const statusDeleteIntervalList: NodeJS.Timeout[] = [];

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
     * 실제적인 status connection 실시메소드
     * @param socketId
     * @param userPayload
     * @returns
     */
    async statusConnection(socketId: string, userPayload: IUserPayload) {
        try {
            const companyContainer = await this.getCompanyContainer(userPayload.COMPANY_PK);

            const packet = await new Promise<{ isSendable: boolean; user: User }>(async (resolve, rejects) => {
                const { USER_PK } = userPayload;
                let isSendable = false;
                companyContainer.userList.some((user) => {
                    let flag = false;

                    if (user.userPK === USER_PK) {
                        isSendable = !user.logOutPending;
                        clearTimeout(user.intervalId);
                        user.socketId = socketId; // 삭제 취소 소켓 아이디 업데이트

                        flag = true;
                    }

                    return flag;
                });

                await this.saveCompContainer(userPayload.COMPANY_PK, companyContainer);

                resolve({
                    isSendable,
                    user: await getRepo(UserRepository).getUserInfoWithUserPK(userPayload.USER_PK),
                });
            });

            return packet;
        } catch (err) {
            throw err;
        }
    }

    /**
     * status disconnect를 시행하는 메소드, 5분의 유예기간을 줌
     * @param socketId
     */
    async statusDisconnect(socketClient: Socket) {
        console.log('socket/statusDisconnect start');

        const statusContainer = await this.getStatusContainer(socketClient.id);
        const userInfo = await getRepo(UserRepository).getUserInfoWithUserPK(statusContainer.userPK);

        const intervalId = setTimeout(async () => {
            const companyContainer = await this.getCompanyContainer(userInfo.COMPANY_PK);

            // 삭제할 유저의 index 서칭
            let detectedIdx = -1;
            companyContainer.userList.some((curr, idx) => {
                if (curr.userPK === userInfo.USER_PK) {
                    detectedIdx = idx;
                    curr.logOutPending = true;
                }
                return curr.userPK === userInfo.USER_PK;
            });

            // delete process
            if (detectedIdx !== -1) {
                companyContainer.userList.splice(detectedIdx, 0);
                await this.saveCompContainer(userInfo.COMPANY_PK, companyContainer);
                socketClient.emit('client/disconnected', 'success disconnect process');
            }
        }, 1000 * 5);

        // add delayId
        const companyContainer = await this.getCompanyContainer(userInfo.COMPANY_PK);
        companyContainer.userList.some((user) => {
            let flag = false;

            if (user.userPK === userInfo.USER_PK) {
                user.intervalId = intervalId;
                user.socketId = '';
                flag = true;
            }

            return flag;
        });
    }

    /**
     * 로그인 시 status를 온라인으로 추가하는 메소드
     * @param user
     */
    async setOnline(user: User) {
        const companyContainer: CompanyContainer = {
            userList: [],
        };
        const item = {
            socketId: undefined,
            userPK: user.USER_PK,
            intervalId: undefined,
            logOutPending: false,
        }; // insert item
        const reply = await this.getCompanyContainer(user.COMPANY_PK);

        // 로그인 유저가 전혀 없는 경우
        if (!reply) companyContainer.userList.push(item);
        else {
            // 로그인 유저가 존재하는 경우
            reply.userList.push(item);
            companyContainer.userList = reply.userList;
        }

        this.saveCompContainer(user.COMPANY_PK, companyContainer);
    }

    // TODO:후일 지워야함.
    async testSendMsg(text: string) {
        console.log(text);
    }

    // * util functions
    async getCompanyContainer(COMPANY_PK: number) {
        return await new Promise<CompanyContainer>((resolve, reject) => {
            client.hget('status/companyContainer', COMPANY_PK.toString(), (err, reply) => {
                if (err) throw err;

                resolve(JSON.parse(reply) as CompanyContainer);
            });
        });
    }

    async saveCompContainer(companyPK: number, container: CompanyContainer) {
        return client.hset('status/companyContainer', companyPK.toString(), JSON.stringify(container));
    }

    async saveStatusContainer(socketId: string, companyPK: number, userPK: number) {
        // 'companyList' - 'socketId' - 'companyPK'

        return client.hset('status/statusContainer', socketId, JSON.stringify({ companyPK, userPK }));
    }

    async getStatusContainer(socketId: string) {
        return await new Promise<StatusSocketContainer>((resolve, rejects) => {
            client.hget('status/statusContainer', socketId, (err, reply) => {
                if (err) throw err;

                resolve(JSON.parse(reply) as StatusSocketContainer);
            });
        });
    }

    async deleteStatusContainer(socketId: string) {
        client.hdel('status/StatusContainer', socketId);
    }
}
