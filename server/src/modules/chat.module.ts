import { Module } from '@nestjs/common';
import ChatController from 'src/controllers/Chat.controller';

@Module({
    controllers: [ChatController],
})
export default class ChatModule {}
