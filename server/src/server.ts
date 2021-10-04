import express from 'express';
import cookieParser from 'cookie-parser';
import http from 'http';
import cors from 'cors';
import route from './routers';

const app = express();

// * file upload using multer
app.use('/images', express.static('./upload'));

// * encoding & json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// * CORS support
app.use(cors());

// * Cookie
app.use(cookieParser());

// * routing!
app.use('/api', route);

// * proxy port
const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Listening on port= ', port));

// * web socket
interface IMessage {
    sendTo: number;
    message: string;
}
interface IConnection {
    userId: number;
}
import { UserInfo } from './database/tablesInterface';
import { Server, Socket } from 'socket.io';
import socketService from './services/socketService';

let userList: UserInfo[] = [];
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const chat = io.of('/chat1');
chat.on('connection', (socket) => {
    /**
     * Connection Process
     */
    console.log('실행중');
    socket.on('connected', async (connInfo: IConnection) => {
        console.log('연결실행');
        console.log(`connected Id: ${socket.id}`);
        const userInfo = await socketService.addSocketId(connInfo.userId, socket.id);
        userList.push(userInfo);
        socket.emit('connected', userInfo);
    });

    /**
     * Send message process to specific one
     */
    socket.on('send', async (message: IMessage) => {
        const rows = await socketService.findSocketId(message.sendTo);
        const targetSocketId = rows[0].SOCKET_ID;
        socket.to(targetSocketId).emit('send', message.message);
    });
});
io.listen(5001);
