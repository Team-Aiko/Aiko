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
            if (state) {
                const memberMap = action.member.reduce((map, obj) => {
                    map.set(obj.USER_PK, { ...obj });
                    return map;
                }, new Map());
                return memberMap;
            }

        case SET_MEMBER_STATUS:
            if (state) {
                const newState = new Map(state);
                newState.has(action.user.userPK) &&
                    newState.set(action.user.userPK, {
                        ...newState.get(action.user.userPK),
                        status: action.user.status,
                    });
                return newState;
            }

        case SET_MEMBER_LIST_STATUS:
            if (state) {
                const newState = new Map(state);
                for (const row of action.memberList) {
                    newState.has(row.userPK) &&
                        newState.set(row.userPK, {
                            ...newState.get(row.userPK),
                            status: row.status,
                        });
                }
                return newState;
            }

        case SET_MEMBER_CHAT_ROOM_PK:
            if (state) {
                const newState = new Map(state);
                for (const room of action.roomList) {
                    newState.has(room[room.member]) &&
                        newState.set(room[room.member], {
                            ...newState.get(room[room.member]),
                            CR_PK: room.CR_PK,
                        });
                }
                return newState;
            }
        default:
            return state;
    }
};

export default memberReducer;
