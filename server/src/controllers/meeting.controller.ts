import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AikoError, resExecutor, success, unknownError } from 'src/Helpers';
import { UserGuard } from 'src/guard/user.guard';
import MeetingService from 'src/services/meeting.service';
import { IUserPayload } from 'src/interfaces/jwt/jwtPayloadInterface';
import { IMeetingRoomBundle } from 'src/interfaces/MVC/meetingMVC';

@UseGuards(UserGuard)
@Controller('meeting')
export default class MeetingController {
    constructor(private meetingService: MeetingService) {}

    @Post('creation-meeting-room')
    async makeMeetingRoom(@Req() req: Request, @Res() res: Response) {
        const { isOnline, roomName, locate, userPayload } = req.body;
        const { COMPANY_PK, grants } = userPayload as IUserPayload;
        const bundle: IMeetingRoomBundle = {
            isOnline,
            roomName,
            locate,
            grants,
            companyPK: COMPANY_PK,
        };
        try {
            await this.meetingService.makeMeetingRoom(bundle);
        } catch (err) {
            if (err instanceof AikoError) throw resExecutor(res, err);
        }
    }
}
