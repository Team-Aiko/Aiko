import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { resExecutor, usrPayloadParser } from 'src/Helpers';
import { UserGuard } from 'src/guard/user.guard';
import MeetingService from 'src/services/meeting.service';
import { IMeetingRoomBundle, IMeetingBundle } from 'src/interfaces/MVC/meetingMVC';

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
            const result = await this.meetingService.makeMeetingRoom(bundle);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    @Post('delete-meeting-room')
    async deleteMeetingRoom(@Req() req: Request, @Res() res: Response) {
        const { ROOM_PK } = req.body;
        const { grants } = usrPayloadParser(req);

        try {
            const result = await this.meetingService.deleteMeetingRoom(ROOM_PK, grants);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
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
            const result = await this.meetingService.updateMeetingRoom(bundle);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    @Get('view-meeting-room')
    async viewMeetingRoom(@Req() req: Request, @Res() res: Response) {
        const { roomId } = req.query;

        try {
            const result = await this.meetingService.viewMeetingRoom(Number(roomId));
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    @Get('meeting-room-list')
    async getMeetingRoomList(@Req() req: Request, @Res() res: Response) {
        const { COMPANY_PK } = usrPayloadParser(req);

        try {
            const result = await this.meetingService.getMeetRoomList(COMPANY_PK);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    @Post('make-meeting')
    async makeMeeting(@Req() req: Request, @Res() res: Response) {
        const { calledMemberList, MAX_MEM_NUM, ROOM_PK, TITLE, DATE, DESCRIPTION } = req.body;
        const { COMPANY_PK } = usrPayloadParser(req);

        const bundle: IMeetingBundle = {
            calledMemberList,
            MAX_MEM_NUM,
            ROOM_PK,
            TITLE,
            DATE,
            COMPANY_PK,
            DESCRIPTION,
        };

        try {
            const result = await this.meetingService.makeMeeting(bundle);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    @Get('check-meet-schedule')
    async checkMeetSchedule(@Req() req: Request, @Res() res: Response) {
        try {
            const { userId } = req.query;
            const { USER_PK } = usrPayloadParser(req);

            let sendId = Number(userId);

            if (!sendId) sendId = USER_PK;

            const result = await this.meetingService.checkMeetSchedule(sendId);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }
    /**
     * meeting schedule을 업데이트하는 api
     * 인원의 변동이 없을 경우 빈배열 []을 넣는다.
     * @param req
     * @param res
     */
    @Post('update-meeting')
    async updateMeeting(@Req() req: Request, @Res() res: Response) {
        const { calledMemberList, MAX_MEM_NUM, ROOM_PK, TITLE, DATE, DESCRIPTION, MEET_PK } = req.body;
        const { COMPANY_PK } = usrPayloadParser(req);

        const bundle: IMeetingBundle = {
            DATE,
            DESCRIPTION,
            MAX_MEM_NUM,
            MEET_PK,
            ROOM_PK,
            TITLE,
            calledMemberList,
            COMPANY_PK,
        };

        try {
            const result = await this.meetingService.updateMeeting(bundle);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    @Post('delete-meeting')
    async deleteMeeting(@Req() req: Request, @Res() res: Response) {
        const { meetPK } = req.body;
        const { COMPANY_PK } = usrPayloadParser(req);

        try {
            const result = await this.meetingService.deleteMeeting(meetPK, COMPANY_PK);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }
}
