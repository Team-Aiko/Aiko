import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AikoError, resExecutor, success, unknownError, usrPayloadParser } from 'src/Helpers';
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
        const { IS_ONLINE, ROOM_NAME, LOCATE } = req.body;
        const { COMPANY_PK, grants } = usrPayloadParser(req);
        const bundle: IMeetingRoomBundle = {
            IS_ONLINE,
            ROOM_NAME,
            LOCATE,
            grants,
            COMPANY_PK,
        };
        try {
            const roomPK = await this.meetingService.makeMeetingRoom(bundle);
            resExecutor(res, success, roomPK);
        } catch (err) {
            throw resExecutor(res, err instanceof AikoError ? err : unknownError);
        }
    }

    @Post('delete-meeting-room')
    async deleteMeetingRoom(@Req() req: Request, @Res() res: Response) {
        const { ROOM_PK } = req.body;
        const { grants } = usrPayloadParser(req);

        try {
            const flag = await this.meetingService.deleteMeetingRoom(ROOM_PK, grants);
            resExecutor(res, success, flag);
        } catch (err) {
            throw resExecutor(res, err instanceof AikoError ? err : unknownError);
        }
    }

    @Post('update-meeting-room')
    async updateMeetingRoom(@Req() req: Request, @Res() res: Response) {
        const { IS_ONLINE, LOCATE, ROOM_NAME, ROOM_PK }: Partial<IMeetingRoomBundle> = req.body;
        const { COMPANY_PK, grants } = usrPayloadParser(req);
        const bundle: IMeetingRoomBundle = {
            ROOM_PK,
            COMPANY_PK,
            IS_ONLINE,
            LOCATE,
            ROOM_NAME,
            grants,
        };

        try {
            const flag = await this.meetingService.updateMeetingRoom(bundle);
            resExecutor(res, success, flag);
        } catch (err) {
            console.error(err);
            throw resExecutor(res, err instanceof AikoError ? err : unknownError);
        }
    }
}
