import '../styles/globals.css';
// import { makeStyles, createStyles, createTheme, ThemeProvider } from '@material-ui/styles';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from '../_redux/store';
import TopNav from '../components/commons/TopNav';

// const theme = createTheme();

// eslint-disable-next-line react/prop-types
function MyApp({ Component, pageProps }) {
    return (
        <>
            <ReduxProvider store={store}>
                <PersistGate persistor={persistor}>
                    <TopNav />
                    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                    <Component {...pageProps} />
                </PersistGate>
            </ReduxProvider>
        </>
    );
}

export default MyApp;
