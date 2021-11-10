import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import SocketController from 'src/controllers/socket.controller';
import OneToOneMessageGateway from 'src/gateway/message.gateway';
import StatusGateway from 'src/gateway/status.gateway';
import SocketService from 'src/services/socket.service';
import { Company, Department, Country, LoginAuth, ResetPw, Socket, User, ChatFile, OTOChatRoom } from '../entity';
import { PriavateChatlog, PrivateChatlogSchema } from 'src/schemas/chatlog.schema';
import { Status, StatusSchema } from 'src/schemas/status.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: PriavateChatlog.name, schema: PrivateChatlogSchema },
            { name: Status.name, schema: StatusSchema },
        ]),
    ],
    controllers: [SocketController],
    providers: [SocketService, OneToOneMessageGateway, StatusGateway],
    exports: [SocketService, OneToOneMessageGateway, StatusGateway],
})
export default class SocketModule {}
