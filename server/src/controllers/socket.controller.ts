import { Controller, Get, HttpException, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import SocketService from 'src/services/socket.service';
import { User } from 'src/entity';
import { resExecutor } from 'src/Helpers/functions';

@Controller('socket')
export default class SocketController {
    constructor(private socketService: SocketService) {}

    @Get('generation-chat-room')
    makeOneToOneChatRooms(@Req() req: Request, @Res() res: Response) {
        const userInfo: User = req.body.userPayload;
        this.socketService
            .makeOneToOneChatRooms(userInfo)
            .then((result) => {
                res.send(resExecutor(res, 'error', 500, 500000, result));
            })
            .catch((err) => {
                console.error('error catch account controller: ', err);
                resExecutor(res, 'error', 500, 500000);
            });
    }
}
