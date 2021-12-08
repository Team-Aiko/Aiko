/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

// * Initial State
const initialState = {
    COMPANY_PK: undefined, // number
    DEPARTMENT_PK: undefined, // number
    COUNTRY_PK: undefined, // number
    USER_PK: undefined, // number
    NICKNAME: undefined, // string
    USER_PROFILE_PK: undefined, //number
    grants: [], // Grant[] . /server/entity/grant.entity.ts 참조
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
