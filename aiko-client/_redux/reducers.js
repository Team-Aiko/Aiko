import { combineReducers } from 'redux';
import popupReducer from './popupReducer';
import accountReducer from './accountReducer';
import businessReducer from './businessReducer';

const rootReducer = combineReducers({
    popupReducer,
    accountReducer,
    businessReducer,
});

export default rootReducer;
