import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { resExecutor } from 'src/Helpers';
import { bodyChecker } from 'src/Helpers/functions';
import ChatService from 'src/services/chat.service';

@Controller('/chat')
export default class ChatController {
    constructor(private readonly chatService: ChatService) {}

    // ! api doc
    @Post('private-chat-log')
    async getPrivateChatLog(@Req() req: Request, @Res() res: Response) {
        try {
            const { roomId, startTime, endTime } = req.body;
            bodyChecker({ roomId, startTime, endTime }, { roomId: 'string', startTime: 'number', endTime: 'number' });

            const result = await this.chatService.getPrivateChatLog(roomId as string, startTime, endTime);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }
}
