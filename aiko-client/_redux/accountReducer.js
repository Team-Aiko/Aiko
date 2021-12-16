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
    status: undefined, // number
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
        resetUserInfo() {
            return {
                COMPANY_PK: undefined, // number
                DEPARTMENT_PK: undefined, // number
                COUNTRY_PK: undefined, // number
                USER_PK: undefined, // number
                NICKNAME: undefined, // string
                USER_PROFILE_PK: undefined, // number
                grants: [],
                status: undefined, // number
                TEL: undefined, // string
                EMAIL: undefined, // string
            };
        },
    },
});

export const { setUserInfo, resetUserInfo } = accountSlice.actions;
export default accountSlice.reducer;
