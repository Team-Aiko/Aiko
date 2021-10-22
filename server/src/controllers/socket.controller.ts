import { Controller, Get, HttpException, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import SocketService from 'src/services/socket.service';
import { User } from 'src/entity';
import { resExecutor } from 'src/Helpers/functions';
import { AikoError } from 'src/Helpers/classes';

@Controller('socket')
export default class SocketController {
    readonly success = new AikoError('OK', 200, 200000);

    constructor(private socketService: SocketService) {}

    @Get('generation-chat-room')
    async makeOneToOneChatRooms(@Req() req: Request, @Res() res: Response) {
        const userInfo: User = req.body.userPayload;
        try {
            const data = await this.socketService.makeOneToOneChatRooms(userInfo);
            resExecutor(res, this.success, data);
        } catch (err) {
            if (err instanceof AikoError) throw resExecutor(res, err);
        }
    }
}
