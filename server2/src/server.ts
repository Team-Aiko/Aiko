import express from 'express';
import redis from 'redis';
import cookieParser from 'cookie-parser';
import http from 'http';
import cors from 'cors';
import route from './routers';
import socketService from './services/socketService';

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

// * redis
const client = redis.createClient();
setInterval(() => {
    // redis save process...
    client.bgsave();
}, 1000 * 60 * 60 * 24);

// * web socket
const server = http.createServer(app);
socketService.socketConnections(server, client);
