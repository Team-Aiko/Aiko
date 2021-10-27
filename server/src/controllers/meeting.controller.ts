import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserGuard } from 'src/guard/user.guard';

@UseGuards(UserGuard)
@Controller('meeting')
export default class MeetingController {}
