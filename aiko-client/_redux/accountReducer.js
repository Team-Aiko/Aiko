/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

// * Initial State
const initialState = {
    COMPANY_PK: undefined, // number
    DEPARTMENT_NAME: '',
    DEPARTMENT_PK: undefined, // number
    EMAIL: '',
    NICKNAME: undefined, // string
    USER_PK: undefined, // number
    loginToken: undefined, // token string
};

// * slice
const accountSlice = createSlice({
    name: 'accountReducer',
    initialState,
    reducers: {
        setUserInfo(state, action) {
            // payload {USER_PK, COMPANY_PK, NICKNAME}
            Object.keys(action.payload).forEach((curr) => {
                state[curr] = action.payload[curr];
            });
        },
        setLoginToken(state, action) {
            state.loginToken = action.payload;
        },
    },
});

export const { setUserInfo, setLoginToken } = accountSlice.actions;
export default accountSlice.reducer;
