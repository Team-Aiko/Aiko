import { Controller } from '@nestjs/common';
import SocketService from 'src/services/socket.service';

@Controller('socket')
export default class SocketController {
    constructor(private socketService: SocketService) {}
}
