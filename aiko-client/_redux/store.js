import { configureStore } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import { persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer from './reducers';

// * settings for redux-pesist
const persistConfig = {
    key: 'root',
    storage,
    blacklist: [],
};

const prstReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: prstReducer,
});

const persistor = persistStore(store);

export default store;
export { persistor };
