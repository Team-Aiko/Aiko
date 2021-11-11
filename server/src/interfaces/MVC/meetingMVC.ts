import { CalledMembers, Grant, Meet, User } from 'src/entity';

export interface IMeetingRoomBundle {
    ROOM_PK?: number;
    IS_ONLINE: boolean;
    ROOM_NAME: string;
    LOCATE: string;
    grants: Grant[];
    COMPANY_PK: number;
}

export interface IMeetingPagination {
    ROOM_PK: number;
    COMPANY_PK: number;
    USER_PK: number;
    currentPage: number;
    feedsPerPage?: number;
    groupCnt?: number;
}

export interface IMeetingSchedulePagination {
    USER_PK: number;
    COMPANY_PK: number;
    currentPage: number;
    feedsPerPage?: number;
    groupCnt?: number;
}

export interface IMeetingBundle {
    calledMemberList?: number[];
    ROOM_PK?: number;
    MAX_MEM_NUM?: number;
    TITLE?: string;
    DATE?: number;
    MEET_PK?: number;
    COMPANY_PK?: number;
    DESCRIPTION?: string;
}

export interface meetingScheduleDTO extends Meet {
    userInfos: User[];
}
