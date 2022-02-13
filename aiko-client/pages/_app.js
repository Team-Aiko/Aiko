import '../styles/globals.css';
// import { makeStyles, createStyles, createTheme, ThemeProvider } from '@material-ui/styles';
import React, { useState, useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from '../_redux/store';
import TopNav from '../components/commons/TopNav';
import ChatBtn from '../components/commons/chat/ChatBtn';
import { io } from 'socket.io-client';

// const theme = createTheme();

// eslint-disable-next-line react/prop-types
function MyApp({ Component, pageProps }) {
    const [privateSocket, setPrivateSocket] = useState(undefined);
    const [groupSocket, setGroupSocket] = useState(undefined);

    useEffect(() => {
        const privateSocket = io('http://localhost:5001/private-chat', { withCredentials: true });
        setPrivateSocket(privateSocket);

        const groupSocket = io('http://localhost:5001/group-chat', { withCredentials: true });
        setGroupSocket(groupSocket);
    }, []);

    return (
        <>
            <ReduxProvider store={store}>
                <PersistGate persistor={persistor}>
                    <TopNav />
                    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                    <Component {...pageProps} />
                    <ChatBtn privateSocket={privateSocket} groupSocket={groupSocket} />
                </PersistGate>
            </ReduxProvider>
        </>
    );
}

export default MyApp;
