/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

// * Initial States
const initialState = {
    sideNavIsOpen: false,
};

// * slice
const popupSlice = createSlice({
    name: 'popupReducer',
    initialState,
    reducers: {
        handleSideNav(state, action) {
            // payload: boolean
            state.sideNavIsOpen = action.payload;
        },
    },
});

export const { handleSideNav } = popupSlice.actions;
export default popupSlice.reducer;
