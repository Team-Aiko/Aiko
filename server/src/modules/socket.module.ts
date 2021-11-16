import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import SocketController from 'src/controllers/socket.controller';
import StatusGateway from 'src/gateway/status.gateway';
import SocketService from 'src/services/socket.service';
import { PrivateChatlog, PrivateChatlogSchema } from 'src/schemas/chatlog.schema';
import { Status, StatusSchema } from 'src/schemas/status.schema';
import PrivateChatGateway from 'src/gateway/privateChat.gateway';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: PrivateChatlog.name, schema: PrivateChatlogSchema },
            { name: Status.name, schema: StatusSchema },
        ]),
    ],
    controllers: [SocketController],
    providers: [SocketService, StatusGateway, PrivateChatGateway],
    exports: [SocketService, StatusGateway, PrivateChatGateway],
})
export default class SocketModule {}
