import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    deptPK: -1,
    deptMember: [],
    oneMem: {},
};

const businessSlice = createSlice({
    name: 'businessReducer',
    initialState,
    reducers: {
        setDeptPK(state, action) {
            state.deptPK = action.payload;
        },
        setDeptMember(state, action) {
            state.deptMember = action.payload;
        },
        setOneMem(state, action) {
            state.oneMem = action.payload;
        },
    },
});

export const { setDeptPK, setDeptMember, setOneMem } = businessSlice.actions;
export default businessSlice.reducer;
