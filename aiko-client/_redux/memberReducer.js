export const SET_MEMBER = 'SET_MEMBER';
export const SET_MEMBER_STATUS = 'SET_MEMBER_STATUS';
export const SET_MEMBER_LIST_STATUS = 'SET_MEMBER_LIST_STATUS';

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
        default:
            return state;
    }
};

export default memberReducer;
