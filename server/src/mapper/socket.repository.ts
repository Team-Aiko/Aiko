import { Repository, EntityRepository } from 'typeorm';
import { Socket } from 'src/entity';
import { AikoError } from 'src/Helpers/classes';

@EntityRepository(Socket)
export default class SocketRepository extends Repository<Socket> {
    async addSocketId(userId: number, socketId: string): Promise<boolean> {
        let flag = false;

        try {
            const socketId = await this.findSocketId(userId);

            // socketId가 이미 있는 경우 새로 업데이트
            if (socketId) await this.updateSocketId(socketId, userId);
            // socketId가 없는 경우 인서트
            else {
                await this.createQueryBuilder()
                    .insert()
                    .into(Socket)
                    .values({
                        SOCKET_ID: socketId,
                        USER_PK: userId,
                    })
                    .execute();
            }

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
                .where('s.SOCKET_ID = :SOCKET_ID', { SOCKET_ID: socketId })
                .execute();
            flag = true;
        } catch (err) {
            console.error(err);
            throw err;
        }

        return flag;
    }

    async updateSocketId(socketId: string, userId: number) {
        let flag = false;

        try {
            await this.createQueryBuilder('s')
                .update()
                .set({ SOCKET_ID: socketId })
                .where('s.USER_PK = :USER_PK', { USER_PK: userId })
                .execute();

            flag = true;
        } catch (err) {
            throw new AikoError('socketId upcate fail', 500, 500000);
        }

        return flag;
    }

    async findUserId(socketId: string): Promise<number> {
        let userId = -1;

        try {
            const result = await this.createQueryBuilder('s')
                .where('s.SOCKET_ID = :SOCKET_ID', { SOCKET_ID: socketId })
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
                .where('s.USER_PK = :USER_PK', { USER_PK: userId })
                .getOneOrFail();
            socketId = result?.SOCKET_ID;
        } catch (err) {
            console.error(err);
            throw err;
        }

        return socketId;
    }
}
