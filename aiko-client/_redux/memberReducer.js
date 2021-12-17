export const SET_MEMBER = 'SET_MEMBER';
export const SET_MEMBER_STATUS = 'SET_MEMBER_STATUS';
export const SET_MEMBER_LIST_STATUS = 'SET_MEMBER_LIST_STATUS';
export const SET_MEMBER_CHAT_ROOM_PK = 'SET_MEMBER_CHAT_ROOM_PK';

export const setMember = (member) => ({
    type: SET_MEMBER,
    member,
});

export const setMemberStatus = (user) => ({
    type: SET_MEMBER_STATUS,
    user,
});

export const setMemberListStatus = (memberList) => ({
    type: SET_MEMBER_LIST_STATUS,
    memberList,
});

export const setMemberChatRoomPK = (roomList) => ({
    type: SET_MEMBER_CHAT_ROOM_PK,
    roomList,
});

const memberReducer = (state = [], action) => {
    switch (action.type) {
        case SET_MEMBER:
            return action.member;
        case SET_MEMBER_STATUS:
            if (state) {
                const updateMember = state.map((row) => {
                    if (row.USER_PK === action.user.userPK) {
                        return {
                            ...row,
                            status: action.user.status,
                        };
                    } else {
                        return {
                            ...row,
                        };
                    }
                });
                return updateMember;
            }
        case SET_MEMBER_LIST_STATUS:
            if (state) {
                const updateMember = [];
                for (const row of action.memberList) {
                    for (const member of state) {
                        if (member.USER_PK === row.userPK) {
                            updateMember.push({
                                ...member,
                                status: row.status,
                            });
                        }
                    }
                }
                return updateMember;
            }
        case SET_MEMBER_CHAT_ROOM_PK:
            if (state) {
                // console.log('state : ', state);
                // console.log(action.roomList);
                const updateMember = [];
                for (const member of state) {
                    for (const room of action.roomList) {
                        if (member.USER_PK === room[room.member]) {
                            updateMember.push({
                                ...member,
                                CR_PK: room.CR_PK,
                            });
                        }
                    }
                }
                return updateMember;
            }
        default:
            return state;
    }
};

export default memberReducer;
