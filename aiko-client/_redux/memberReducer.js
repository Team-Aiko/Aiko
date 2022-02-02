import { createSlice } from '@reduxjs/toolkit';

const initialState = [];

const memberSlice = createSlice({
    name: 'memberReducer',
    initialState,
    reducers: {
        setMember(state, action) {
            return action.payload;
        },
        setMemberStatus(state, action) {
            if (state) {
                const updateMember = state.map((row) => {
                    if (row.USER_PK === action.payload.userPK) {
                        return {
                            ...row,
                            status: action.payload.status,
                        };
                    } else {
                        return {
                            ...row,
                        };
                    }
                });
                return updateMember;
            }
        },
        setMemberChatRoomPK(state, action) {
            if (state) {
                const updateMember = [];
                for (const member of state) {
                    for (const room of action.payload) {
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
        },
    },
});

export const { setMember, setMemberStatus, setMemberChatRoomPK } = memberSlice.actions;
export default memberSlice.reducer;
