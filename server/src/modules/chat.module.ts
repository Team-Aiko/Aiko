import { Module } from '@nestjs/common';
import ChatController from 'src/controllers/Chat.controller';
import ChatService from 'src/services/chat.service';

@Module({
    controllers: [ChatController],
    providers: [ChatService],
    exports: [ChatService],
})
export default class ChatModule {}
