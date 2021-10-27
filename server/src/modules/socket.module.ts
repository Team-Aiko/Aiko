import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import SocketController from 'src/controllers/socket.controller';
import OneToOneMessageGateway from 'src/gateway/message.gateway';
import StatusGateway from 'src/gateway/status.gateway';
import SocketService from 'src/services/socket.service';
import { Company, Department, Country, LoginAuth, ResetPw, Socket, User, ChatFile, OTOChatRoom } from '../entity';
@Module({
    imports: [],
    controllers: [SocketController],
    providers: [SocketService, OneToOneMessageGateway, StatusGateway],
    exports: [SocketService, OneToOneMessageGateway, StatusGateway],
})
export default class SocketModule {}
