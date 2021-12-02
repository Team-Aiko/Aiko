import { Module } from '@nestjs/common';
import ChatController from 'src/controllers/chat.controller';
import ChatService from 'src/services/chat.service';

@Module({ imports: [], controllers: [ChatController], providers: [ChatService], exports: [ChatService] })
export default class ChatModule {}
