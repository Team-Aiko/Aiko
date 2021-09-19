import '../styles/globals.css';
import {makeStyles, createStyles, createTheme, ThemeProvider} from '@material-ui/styles';

// const theme = createTheme();

function MyApp({Component, pageProps}) {
    return (
        // <ThemeProvider theme={theme}>
        <Component {...pageProps} />
        // </ThemeProvider>
    );
}

export default MyApp;
