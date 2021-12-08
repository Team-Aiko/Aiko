import { combineReducers } from 'redux';
import popupReducer from './popupReducer';
import accountReducer from './accountReducer';
import businessReducer from './businessReducer';
import boardReducer from './boardReducer';
import memberReducer from './memberReducer';

const rootReducer = combineReducers({
    popupReducer,
    accountReducer,
    businessReducer,
    boardReducer,
    memberReducer,
});

export default rootReducer;
