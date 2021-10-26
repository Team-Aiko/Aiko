import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';
import { SocketRepository, UserRepository, OTOChatRoomRepository } from 'src/mapper';
import { getRepo } from 'src/Helpers/functions';
import { User } from 'src/entity';
import { AikoError } from 'src/Helpers/classes';
import { EntityManager, TransactionManager } from 'typeorm';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';
import { resolve } from 'path/posix';
import { rejects } from 'assert';

interface CompanyContainer {
    userList: { socketId: string; userPK: number; intervalId: NodeJS.Timeout | undefined }[];
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
     * 스테이터스 커넥션을 시행하는 메소드
     * @param socketId
     * @param userPayload
     * @returns
     */
    async statusConnection(socketId: string, userPayload: IUserPayload) {
        try {
            const flag = await new Promise<boolean>((resolve, rejects) => {
                const { USER_PK } = userPayload;
                client.hget('status', userPayload.COMPANY_PK.toString(), async (err, reply) => {
                    if (err) rejects(false);

                    const companyContainer = JSON.parse(reply) as CompanyContainer;
                    const { userList } = companyContainer;
                    userList.some((user) => {
                        let flag = false;

                        if (user.userPK === USER_PK) {
                            clearTimeout(user.intervalId);
                            user.socketId = socketId; // 삭제 취소 소켓 아이디 업데이트
                            flag = true;
                        }

                        return flag;
                    });

                    resolve(true);
                });
            });

            if (!flag) {
                const packet = await new Promise<{ isSendable: boolean; user: User }>((resolve, reject) => {
                    client.hget('status', userPayload.COMPANY_PK.toString(), async (err, reply) => {
                        if (err) reject(new AikoError('redis error', 1, 501119));

                        const companyContainer = JSON.parse(reply) as CompanyContainer;
                        const isIn = companyContainer.userList.some((user) => user.userPK === userPayload.USER_PK);
                        if (!isIn) {
                            client.hset('status', userPayload.COMPANY_PK.toString(), userPayload.USER_PK.toString());
                        }
                        resolve({
                            isSendable: !isIn,
                            user: !isIn
                                ? await getRepo(UserRepository).getUserInfoWithUserPK(userPayload.USER_PK)
                                : undefined,
                        });
                    });
                });

                return packet;
            }

            return { isSendable: false, user: undefined };
        } catch (err) {
            throw err;
        }
    }

    /**
     * status disconnect를 시행하는 메소드
     * @param socketId
     */
    async statusDisonnect(socketId: string) {
        // 5분의 유예기간을 줌
        const userId = await this.findUserId(socketId);
        const userInfo = await getRepo(UserRepository).getUserInfoWithUserPK(userId);

        const intervalId = setTimeout(() => {
            client.hget('status', userInfo.COMPANY_PK.toString(), (err, reply) => {
                const companyContainer = JSON.parse(reply) as CompanyContainer;
                const { userList } = companyContainer;

                // 삭제할 유저의 index 서칭
                let detectedIdx = -1;
                userList.some((curr, idx) => {
                    if (curr.userPK === userInfo.USER_PK) detectedIdx = idx;
                    return curr.userPK === userInfo.USER_PK;
                });

                // delete process
                if (detectedIdx !== -1) {
                    userList.splice(detectedIdx, 0);
                    companyContainer.userList = userList;
                    client.hset('status', userInfo.COMPANY_PK.toString(), JSON.stringify(companyContainer));
                }
            });

            statusDeleteIntervalList.push(intervalId);
        }, 1000 * 5);

        // add delayId
        client.hget('status', userInfo.COMPANY_PK.toString(), (err, reply) => {
            if (err) throw new AikoError('redis error', 1, 501119);

            const companyContainer = JSON.parse(reply) as CompanyContainer;
            const { userList } = companyContainer;
            userList.some((user) => {
                let flag = false;

                if (user.userPK === userInfo.USER_PK) {
                    user.intervalId = intervalId;
                    user.socketId = '';
                    flag = true;
                }

                return flag;
            });
        });
    }

    // TODO:후일 지워야함.
    async testSendMsg(text: string) {
        console.log(text);
    }
}
