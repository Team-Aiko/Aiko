export const SET_MEMBER = 'SET_MEMBER';

export const setMember = (member) => ({
    type: SET_MEMBER,
    member,
});

const memberReducer = (state = [], action) => {
    switch (action.type) {
        case SET_MEMBER:
            return action.member;
        default:
            return state;
    }
};

export default memberReducer;
