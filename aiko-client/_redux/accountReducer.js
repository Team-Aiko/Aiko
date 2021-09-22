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
};

// * slice
const accountSlice = createSlice({
    name: 'accountReducer',
    initialState,
    reducers: {
        setUserInfo(state, action) {
            // payload {USER_PK, COMPANY_PK, NICKNAME, DEPARTMENT_PK, DEPARTMENT_NAME, EMAIL}
            Object.keys(action.payload).forEach((curr) => {
                state[curr] = action.payload[curr];
            });
        },
    },
});

export const { setUserInfo } = accountSlice.actions;
export default accountSlice.reducer;
