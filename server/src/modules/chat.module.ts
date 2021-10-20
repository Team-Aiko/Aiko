import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import SocketService from 'src/services/socket.service';
import { Company, Department, Country, LoginAuth, ResetPw, Socket, User } from '../entity';
@Module({
    imports: [TypeOrmModule.forFeature([Company, Country, Department, LoginAuth, ResetPw, User, Socket])],
    providers: [SocketService],
    exports: [SocketService],
})
export default class ChatModule {}
