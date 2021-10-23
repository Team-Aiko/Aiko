import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Redis } from 'ioredis';
import { Server, ServerOptions } from 'socket.io';
import { RedisClient } from 'redis';
import { createAdapter } from 'socket.io-redis';

export default class RedisIoAdapter extends IoAdapter {
    private readonly subClient: Redis;
    private readonly pubClient: Redis;

    constructor(app: INestApplication) {
        super(app);
    }

    public createIOServer(port: number, options?: ServerOptions): Server {
        const server = super.createIOServer(port, options);
        const pubClient = new RedisClient({
            host: 'localhost',
            port: 6379,
        });
        const subClient = pubClient.duplicate();
        const redisAdapter = createAdapter({ pubClient, subClient });
        server.adapter(redisAdapter);

        return server;
    }
}
