import { Injectable } from '@nestjs/common';
import { IMeetingRoomBundle } from 'src/interfaces/MVC/meetingMVC';
import { AikoError, isChiefAdmin } from 'src/Helpers';

@Injectable()
export default class MeetingService {
    async makeMeetingRoom(bundle: IMeetingRoomBundle) {
        try {
            // auth filter
            isChiefAdmin(bundle.grants);
        } catch (err) {
            if (err instanceof AikoError) throw err;
        }
    }
}
