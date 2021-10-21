import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserInfo } from 'src/interfaces';
import SocketService from 'src/services/socket.service';

@Controller('socket')
export default class SocketController {
    constructor(private socketService: SocketService) {}

    @Get('generation-chat-room')
    makeOneToOneChatRooms(@Req() req: Request, @Res() res: Response) {
        const userInfo: UserInfo = req.body.userPayload;
        this.socketService.makeOneToOneChatRooms(userInfo);
    }
}
