import popupReducer from './popupReducer';
import accountReducer from './accountReducer';
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
    popupReducer,
    accountReducer,
});

export default rootReducer;
