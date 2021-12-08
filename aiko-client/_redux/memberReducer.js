export const SET_MEMBER = 'SET_MEMBER';
export const SET_MEMBER_STATUS = 'SET_MEMBER_STATUS';

export const setMember = (member) => ({
    type: SET_MEMBER,
    member,
});

export const setMemberStatus = (user) => ({
    type: SET_MEMBER_STATUS,
    user,
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
        default:
            return state;
    }
};

export default memberReducer;
