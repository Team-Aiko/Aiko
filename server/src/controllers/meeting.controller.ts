import { Controller, Get, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { resExecutor } from 'src/Helpers';
import { UserGuard } from 'src/guard/user.guard';
import MeetingService from 'src/services/meeting.service';
import {
    IMeetingRoomBundle,
    IMeetingBundle,
    IMeetingPagination,
    IMeetingSchedulePagination,
} from 'src/interfaces/MVC/meetingMVC';
import { bodyChecker } from 'src/Helpers/functions';
import UserPayloadParserInterceptor from 'src/interceptors/userPayloadParser.interceptor';

@UseGuards(UserGuard)
@UseInterceptors(UserPayloadParserInterceptor)
@Controller('meeting')
export default class MeetingController {
    constructor(private meetingService: MeetingService) {}

    // ! api doc
    @Post('creation-meeting-room')
    async makeMeetingRoom(@Req() req: Request, @Res() res: Response) {
        const { IS_ONLINE, ROOM_NAME, LOCATE, userPayload } = req.body;
        const { COMPANY_PK, grants } = userPayload;
        bodyChecker({ IS_ONLINE, ROOM_NAME, LOCATE }, { IS_ONLINE: 'boolean', ROOM_NAME: 'string', LOCATE: 'string' });

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

    // ! api doc
    @Post('delete-meeting-room')
    async deleteMeetingRoom(@Req() req: Request, @Res() res: Response) {
        try {
            const { ROOM_PK, userPayload } = req.body;
            const { grants } = userPayload;
            bodyChecker({ ROOM_PK }, { ROOM_PK: 'number' });

            const result = await this.meetingService.deleteMeetingRoom(ROOM_PK, grants);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    @Post('update-meeting-room')
    async updateMeetingRoom(@Req() req: Request, @Res() res: Response) {
        try {
            const { IS_ONLINE, LOCATE, ROOM_NAME, ROOM_PK }: Partial<IMeetingRoomBundle> = req.body;
            const { userPayload } = req.body;
            const { COMPANY_PK, grants } = userPayload;
            const bundle: IMeetingRoomBundle = {
                ROOM_PK,
                COMPANY_PK,
                IS_ONLINE,
                LOCATE,
                ROOM_NAME,
                grants,
            };

            const result = await this.meetingService.updateMeetingRoom(bundle);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
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

    // ! api doc
    @Get('meeting-room-list')
    async getMeetingRoomList(@Req() req: Request, @Res() res: Response) {
        const { userPayload } = req.body;
        const { COMPANY_PK } = userPayload;

        try {
            const result = await this.meetingService.getMeetRoomList(COMPANY_PK);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    @Post('make-meeting')
    async makeMeeting(@Req() req: Request, @Res() res: Response) {
        const { userPayload, calledMemberList, MAX_MEM_NUM, ROOM_PK, TITLE, DATE, DESCRIPTION } = req.body;
        const { COMPANY_PK } = userPayload;
        bodyChecker(
            { calledMemberList, MAX_MEM_NUM, ROOM_PK, TITLE, DATE, DESCRIPTION },
            {
                calledMemberList: 'number[]',
                MAX_MEM_NUM: 'number',
                ROOM_PK: 'number',
                TITLE: 'string',
                DATE: 'number',
                DESCRIPTION: 'string',
            },
        );

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

    // TODO: no api doc
    /**
     * 미팅 룸 인포페이지에서 스케쥴의 정보를 받아오기 위한 api
     */
    @Get('meet-schedule')
    async meetingSchedule(@Req() req: Request, @Res() res: Response) {
        try {
            const { roomId, currentPage, feedsPerPage, groupCnt } = req.query;
            const { userPayload } = req.body;
            const { COMPANY_PK, USER_PK } = userPayload;

            const bundle: IMeetingPagination = {
                COMPANY_PK,
                USER_PK,
                ROOM_PK: Number(roomId),
                currentPage: Number(currentPage),
                feedsPerPage: feedsPerPage ? Number(feedsPerPage) : 10,
                groupCnt: groupCnt ? Number(groupCnt) : 5,
            };

            const result = await this.meetingService.meetingSchedule(bundle);

            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    /**
     *
     */
    @Get('check-meet-schedule')
    async checkMeetSchedule(@Req() req: Request, @Res() res: Response) {
        try {
            const { userId, currentPage, feedsPerPage, groupCnt } = req.query;
            const { userPayload } = req.body;
            const { USER_PK, COMPANY_PK } = userPayload;

            const bundle: IMeetingSchedulePagination = {
                USER_PK: !userId ? USER_PK : Number(userId),
                COMPANY_PK,
                currentPage: Number(currentPage),
                feedsPerPage: feedsPerPage ? Number(feedsPerPage) : 10,
                groupCnt: groupCnt ? Number(groupCnt) : 5,
            };

            const result = await this.meetingService.checkMeetSchedule(bundle);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    /**
     * meeting schedule을 업데이트하는 api
     * 인원의 변동이 없을 경우 빈배열 []을 넣는다.
     * @param req
     * @param res
     */
    @Post('update-meeting')
    async updateMeeting(@Req() req: Request, @Res() res: Response) {
        try {
            const { userPayload, calledMemberList, MAX_MEM_NUM, ROOM_PK, TITLE, DATE, DESCRIPTION, MEET_PK } = req.body;
            const { COMPANY_PK } = userPayload;
            bodyChecker(
                { calledMemberList, MAX_MEM_NUM, ROOM_PK, TITLE, DATE, DESCRIPTION, MEET_PK },
                {
                    calledMemberList: 'number[]',
                    MAX_MEM_NUM: 'number',
                    ROOM_PK: 'number',
                    TITLE: 'string',
                    DATE: 'number',
                    DESCRIPTION: 'string',
                    MEET_PK: 'number',
                },
            );

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
            const result = await this.meetingService.updateMeeting(bundle);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    @Post('delete-meeting')
    async deleteMeeting(@Req() req: Request, @Res() res: Response) {
        try {
            const { meetPK, userPayload } = req.body;
            const { COMPANY_PK } = userPayload;
            bodyChecker({ meetPK }, { meetPK: 'string' });

            const result = await this.meetingService.deleteMeeting(meetPK, COMPANY_PK);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }

    // ! api doc
    @Post('finish-meeting')
    async finishMeeting(@Req() req: Request, @Res() res: Response) {
        try {
            const { meetPK, finishFlag, userPayload } = req.body;
            const { COMPANY_PK } = userPayload;
            bodyChecker({ meetPK, finishFlag }, { meetPK: 'number', finishFlag: 'boolean' });

            const result = await this.meetingService.finishMeeting(finishFlag, meetPK, COMPANY_PK);
            resExecutor(res, { result });
        } catch (err) {
            throw resExecutor(res, { err });
        }
    }
}
