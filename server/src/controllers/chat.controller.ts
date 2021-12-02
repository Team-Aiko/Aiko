import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { resExecutor } from 'src/Helpers';
import ChatService from 'src/services/chat.service';

@Controller('rest-chat')
export default class ChatController {
    constructor(private chatService: ChatService) {}

    // * group chat controller methods
    @Post('create-gc')
    async createGroupChatRoom(@Req() req: Request, @Res() res: Response) {
        try {
            const { userList, admin, roomTitle, maxNum } = req.body;
            const result = await this.chatService.createGroupChatRoom();
            resExecutor(res, { result });
        } catch (err) {
            resExecutor(res, { err });
        }
    }
}
