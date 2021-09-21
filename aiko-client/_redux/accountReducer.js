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
            console.log('안넘어와?: ', action.payload);
            state.COMPANY_PK = action.payload.COMPANY_PK;
            state.NICKNAME = action.payload.NICKNAME;
            state.USER_PK = action.payload.USER_PK;
        },
    },
});

export const { setUserInfo } = accountSlice.actions;
export default accountSlice.reducer;
