import '../styles/globals.css';
import {makeStyles, createStyles, createTheme, ThemeProvider} from '@material-ui/styles';
import React from 'react';
import TopNav from '../components/commons/TopNav';

// const theme = createTheme();

function MyApp({Component, pageProps}) {
    return (
        <React.Fragment>
            <TopNav />
            <Component {...pageProps} />
        </React.Fragment>
    );
}

export default MyApp;
