import { createSlice } from '@reduxjs/toolkit';

// * Initial State
const initialState = {
    USER_PK: undefined,
    COMPANY_PK: undefined,
    NICKNAME: undefined,
};

// * slice
const accountSlice = createSlice({
    name: 'accountReducer',
    initialState,
    reducers: {
        setUserInfo(state, action) {
            // payload {USER_PK, COMPANY_PK, NICKNAME}
            Object.keys(action.payload).map(curr => {
                state[curr] = action.payload[curr];
            });
        },
    },
});

export const { setUserInfo } = accountSlice.actions;
export default accountSlice.reducer;
