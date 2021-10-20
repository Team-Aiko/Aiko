import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';
import { ISocketService, UserInfo } from '../interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { Socket, User } from '../entity';

const client = createClient();
setInterval(() => {
    // redis save process...
    client.bgsave();
}, 1000 * 60 * 60 * 24);

@Injectable()
export default class SocketService implements ISocketService {
    constructor(
        @InjectRepository(Socket)
        private socketRepo: Repository<Socket>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) {}

    /**
     * socket_table로부터 특정 유저를 삭제.
     * @param userId
     * @returns boolean (성공여부)
     */
    removeSocketId(socketId: string): boolean {
        try {
            this.socketRepo
                .createQueryBuilder('s')
                .delete()
                .where('s.SOCKET_ID = SOCKET_ID', { SOCKET_ID: socketId })
                .execute();

            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    /**
     * companyPK를 이용해 동일한 회사소속의 사원의 리스트를 얻어내는 메소드 (소켓용)
     * @param companyPK
     * @returns UserRepository[]
     */
    getMembers(companyPK: number) {
        return getConnection()
            .createQueryBuilder(User, 'U')
            .select(['U.USER_PK', 'U.DEPARTMENT_PK', 'U.FIRST_NAME', 'U.LAST_NAME', 'U.NICKNAME', 'D.DEPARTMENT_NAME'])
            .leftJoinAndSelect('U.socket', 'S')
            .leftJoinAndSelect('U.company', 'C')
            .where('U.COMPANY_PK = COMPANY_PK', { COMPANY_PK: companyPK })
            .andWhere('C.COMPANY_PK = COMPANY_PK', { COMPANY_PK: companyPK })
            .andWhere('S.USER_PK = U.USER_PK')
            .getMany();
    }

    /**
     * 소켓 아이디를 rdbms로부터 조회하는 메소드
     * @param userId
     * @returns Promise<string> socketId
     */
    async findSocketId(userId: number): Promise<string> {
        try {
            return this.socketRepo
                .createQueryBuilder('s')
                .where('s.USER_PK = USER_PK', { USER_PK: userId })
                .getOneOrFail()
                .then((data) => data.SOCKET_ID);
        } catch (err) {
            console.error(err);
            new Promise<string>((resolve, reject) => resolve(''));
        }
    }

    async findUserId(socketId: string): Promise<number> {
        try {
            return this.socketRepo
                .createQueryBuilder('s')
                .where('s.SOCKET_ID = SOCKET_ID', { SOCKET_ID: socketId })
                .getOneOrFail()
                .then((data) => data.USER_PK);
        } catch (err) {
            console.error(err);
            new Promise((resolve, reject) => resolve(-1));
        }
    }

    addSocketId(socketId: string, userInfo: UserInfo): boolean {
        try {
            // insert into socket table
            getConnection()
                .createQueryBuilder()
                .insert()
                .into(Socket)
                .values({
                    SOCKET_ID: socketId,
                    USER_PK: userInfo?.USER_PK,
                })
                .execute();

            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
}
