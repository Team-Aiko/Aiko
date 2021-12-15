import { Controller, Get, Post, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { resExecutor } from 'src/Helpers';
import ChatService from 'src/services/chat.service';

@Controller('/chat')
export default class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post('private-chat-log')
    async getPrivateChatLog(@Req() req: Request, @Res() res: Response) {
        try {
            const { roomId, startTime, endTime } = req.body;
            this.chatService.getPrivateChatLog(roomId as string, startTime, endTime);
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }
}
