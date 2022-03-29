import '../styles/globals.css';
import React, { useState, useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from '../_redux/store';
import TopNav from '../components/commons/TopNav';
import ChatBtn from '../components/commons/chat/ChatBtn';
import { io } from 'socket.io-client';

// eslint-disable-next-line react/prop-types
function MyApp({ Component, pageProps }) {
    const [statusSocket, setStatusSocket] = useState(null);
    const [privateChatSocket, setPrivateSocket] = useState(null);
    const [groupChatSocket, setGroupChatSocket] = useState(null);
    const [socketConnect, setSocketConnect] = useState({ status: false, privat: false, group: false });

    useEffect(() => {
        const statusIO = io('http://localhost:5001/status', { withCredentials: true, autoConnect: false });
        const privateIO = io('http://localhost:5001/private-chat', { withCredentials: true, autoConnect: false });
        const groupIO = io('http://localhost:5001/group-chat', { withCredentials: true, autoConnect: false });

        setStatusSocket(statusIO);
        setPrivateSocket(privateIO);
        setGroupChatSocket(groupIO);

        console.log('App - setSocket');
    }, []);

    const resetStatusSocket = () => {
        console.log('### resetStatusSocket');
        setStatusSocket(null);
    };

    return (
        <>
            <ReduxProvider store={store}>
                <PersistGate persistor={persistor}>
                    <TopNav
                        statusSocket={statusSocket}
                        privateChatSocket={privateChatSocket}
                        groupChatSocket={groupChatSocket}
                        resetStatusSocket={resetStatusSocket}
                    />
                    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                    <Component {...pageProps} />
                    <ChatBtn />
                </PersistGate>
            </ReduxProvider>
        </>
    );
}

export default MyApp;
