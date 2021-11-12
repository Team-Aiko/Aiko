import { combineReducers } from 'redux';
import popupReducer from './popupReducer';
import accountReducer from './accountReducer';
import businessReducer from './businessReducer';
import boardReducer from './boardReducer';

const rootReducer = combineReducers({
    popupReducer,
    accountReducer,
    businessReducer,
    boardReducer
});

export default rootReducer;
