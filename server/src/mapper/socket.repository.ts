import { Repository, EntityRepository } from 'typeorm';
import { Socket } from 'src/entity';

@EntityRepository(Socket)
export default class SocketRepository extends Repository<Socket> {
    async addSocketId(userId: number, socketId: string): Promise<boolean> {
        let flag = false;

        try {
            await this.createQueryBuilder()
                .insert()
                .into(Socket)
                .values({
                    SOCKET_ID: socketId,
                    USER_PK: userId,
                })
                .execute();
            flag = true;
        } catch (err) {
            throw err;
        }

        return flag;
    }

    /**
     * socket_table로부터 특정 유저를 삭제.
     * @param userId
     * @returns boolean (성공여부)
     */
    async removeSocketId(socketId: string): Promise<boolean> {
        let flag = false;

        try {
            await this.createQueryBuilder()
                .delete()
                .from(Socket, 's')
                .where('s.SOCKET_ID = SOCKET_ID', { SOCKET_ID: socketId })
                .execute();
            flag = true;
        } catch (err) {
            console.error(err);
            throw err;
        }

        return flag;
    }

    async findUserId(socketId: string): Promise<number> {
        let userId = -1;

        try {
            const result = await this.createQueryBuilder('s')
                .where('s.SOCKET_ID = SOCKET_ID', { SOCKET_ID: socketId })
                .getOneOrFail();

            userId = result.USER_PK;
        } catch (err) {
            console.error(err);
        }

        return userId;
    }

    async findSocketId(userId: number): Promise<string> {
        let socketId = '';

        try {
            const result = await this.createQueryBuilder('s')
                .where('s.USER_PK = USER_PK', { USER_PK: userId })
                .getOneOrFail();
            socketId = result.SOCKET_ID;
        } catch (err) {
            console.error(err);
            throw err;
        }

        return socketId;
    }
}
