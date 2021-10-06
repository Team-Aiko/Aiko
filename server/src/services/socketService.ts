import { conn, pool } from '../database';
import { ISocketService } from './_types/socketTypes';
import { SocketTable, UserInfo } from '../database/tablesInterface';
import { Server, Socket } from 'socket.io';
import { IChatBox, IConnection, IMessage, ExtendedUserInfo, EStatus } from './_types/socketTypes';

const socketService: ISocketService = {
    async findSocketId(userId) {
        const connection = await pool.getConnection();

        try {
            const sql = `select
                S.SOCKET_ID,
                S.USER_PK,
                U.NICKNAME,
                U.FIRST_NAME,
                U.LAST_NAME,
                U.COMPANY_PK,
                U.DEPARTMENT_PK,
                U.PROFILE_FILE_NAME
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
    async findUserId(socketId) {
        const connection = await pool.getConnection();
        try {
            const sql = `select
                USER_PK
            FROM
                SOCKET_TABLE
            WHERE
                SOCKET_ID = ?`;
            const [rows, others] = await connection.query(sql, [socketId]);
            const { USER_PK } = JSON.parse(JSON.stringify(rows))[0] as { USER_PK: number };
            return USER_PK;
        } catch (e) {
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
    /**
     * socket connections
     * @param server
     * @param client
     */
    socketConnections(server, client) {
        const io = new Server(server, { cors: { origin: '*' } });
        const chat = io.of('/chat1');
        chat.on('connection', (socket) => {
            console.log('run 1:1 chat channel');
            /**
             * Connection Process
             */
            socket.on('connected', async (connInfo: IConnection) => {
                console.log(`socket connected, connected Id: ${socket.id}`);
                const userInfo = (await socketService.addSocketId(connInfo.userId, socket.id)) as ExtendedUserInfo;
                // update user status --> login
                userInfo.status = EStatus.LOGIN;
                console.log('🚀 ~ file: server.ts ~ line 56 ~ socket.on ~ userInfo', userInfo);
                // input user data to redis
                client.hset('userList', userInfo.USER_PK.toString(), JSON.stringify(userInfo));
                socket.emit('connected', userInfo);
            });

            /**
             * Send message process to specific one
             */
            socket.on('send', async (msg: IMessage) => {
                const { from, sendTo } = msg;

                // send process and receiver update
                client.hget('userList', sendTo.toString(), (err, reply) => {
                    if (err) throw err;

                    const receiver = JSON.parse(reply) as ExtendedUserInfo;
                    const socketId = receiver.SOCKET_ID;
                    // send message to target user
                    socket.to(socketId).emit('send', msg);
                    receiver.messageLog[from].push(msg);

                    //receiver update
                    client.hset('userList', sendTo.toString(), JSON.stringify(receiver));
                });

                // sender update
                client.hget('userList', from.toString(), (err, reply) => {
                    if (err) throw err;

                    const sender = JSON.parse(reply) as ExtendedUserInfo;
                    sender.messageLog[sendTo].push(msg);
                });
            });

            socket.on('disconnect', async (reason) => {
                // update user status --> logout
                const userPK = await socketService.findUserId(socket.id);

                client.hget('userList', userPK.toString(), (err, reply) => {
                    if (err) throw err;

                    const user = JSON.parse(reply) as ExtendedUserInfo;
                    user.status = EStatus.LOGOUT;
                    client.hset('userList', userPK.toString(), JSON.stringify(user));
                });
            });
        });

        io.listen(5001); // socket port listener
    },
};

export default socketService;
