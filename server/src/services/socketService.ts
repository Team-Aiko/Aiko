import { conn, pool } from '../database';
import { ISocketService } from './_types/socketTypes';
import { SocketTable, UserInfo } from '../database/tablesInterface';

const socketService: ISocketService = {
    async findSocketId(userId) {
        const connection = await pool.getConnection();

        try {
            const sql = `
            select
                S.SOCKET_ID,
                S.USER_PK,
                U.NICKNAME,
                U.FIRST_NAME,
                U.LAST_NAME,
                U.COMPANY_PK,
                U.DEPARTMENT_PK
            from
                SOCKET_TABLE S, USER_TABLE U
            where
                U.USER_PK = ?
                and
                U.USER_PK = S.USER_PK`;
            const results = await connection.query(sql, [userId]);
            const [rows, others] = JSON.parse(JSON.stringify(results));

            return rows as UserInfo[];
        } catch (e) {
            console.log(e);
            throw e;
        } finally {
            connection.release();
        }
    },
    async addSocketId(userId, socketId) {
        const connection = await pool.getConnection();
        let userInfo: UserInfo;

        try {
            const sql = ` insert into SOCKET_TABLE (
                SOCKET_ID,
                USER_PK
            ) VALUES (?, ?)`;

            connection.query(sql, [socketId, userId]);
            userInfo = (await this.findSocketId(userId))[0];
        } catch (e) {
            console.log(e);
            throw e;
        } finally {
            connection.release();
        }

        return userInfo;
    },
};

export default socketService;
