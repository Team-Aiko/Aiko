import '../styles/globals.css';
import { makeStyles, createStyles, createTheme, ThemeProvider } from '@material-ui/styles';
import React from 'react';
import store, { persistor } from '../_redux/store';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import TopNav from '../components/commons/TopNav';

// const theme = createTheme();

function MyApp({ Component, pageProps }) {
    return (
        <React.Fragment>
            <ReduxProvider store={store}>
                <PersistGate persistor={persistor}>
                    <TopNav />
                    <Component {...pageProps} />
                </PersistGate>
            </ReduxProvider>
        </React.Fragment>
    );
}

export default MyApp;
