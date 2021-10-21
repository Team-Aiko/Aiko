import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import SocketController from 'src/controllers/socket.controller';
import SocketService from 'src/services/socket.service';
import { Socket, OTOChatRoom } from 'src/entity';

@Module({
    imports: [TypeOrmModule.forFeature([Socket, OTOChatRoom])],
    controllers: [SocketController],
    providers: [SocketService],
    exports: [SocketService],
})
export default class SocketModule {}
