import '../styles/globals.css';
import {makeStyles, createStyles, createTheme, ThemeProvider} from '@material-ui/styles';
import React from 'react';
import store from '../_redux/store';
import {Provider} from 'react-redux';
import TopNav from '../components/commons/TopNav';

// const theme = createTheme();

function MyApp({Component, pageProps}) {
    return (
        <React.Fragment>
            <Provider store={store}>
                <TopNav />
                <Component {...pageProps} />
            </Provider>
        </React.Fragment>
    );
}

export default MyApp;
