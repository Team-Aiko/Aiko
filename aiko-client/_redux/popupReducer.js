import {createAction, createReducer} from '@reduxjs/toolkit';

const handleSideNav = createAction('popup/handleSideNav');
const initialState = {
    sideNavIsOpen: false,
};

const popupReducer = createReducer(initialState, builder => {
    builder.addCase(handleSideNav, (state, action) => {
        state.sideNavIsOpen = action.payload;
    });
});

export default popupReducer;
