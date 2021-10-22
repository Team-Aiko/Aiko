import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import SocketController from 'src/controllers/socket.controller';
import SocketService from 'src/services/socket.service';
import { Company, Department, Country, LoginAuth, ResetPw, Socket, User, ChatFile, OTOChatRoom } from '../entity';
@Module({
    imports: [
        TypeOrmModule.forFeature([
            Company,
            Country,
            Department,
            LoginAuth,
            ResetPw,
            User,
            Socket,
            ChatFile,
            OTOChatRoom,
        ]),
    ],
    controllers: [SocketController],
    providers: [SocketService],
    exports: [SocketService],
})
export default class SocketModule {}
