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
    const [privateChatSocket, setPrivateChatSocket] = useState(null);
    const [groupChatSocket, setGroupChatSocket] = useState(null);
    const [socketConnect, setSocketConnect] = useState({ status: false, private: false, group: false });

    return (
        <>
            <ReduxProvider store={store}>
                <PersistGate persistor={persistor}>
                    <TopNav
                        statusSocket={statusSocket}
                        privateChatSocket={privateChatSocket}
                        groupChatSocket={groupChatSocket}
                        setStatusSocket={(socket) => setStatusSocket(socket)}
                        setPrivateChatSocket={(socket) => setPrivateChatSocket(socket)}
                        setGroupChatSocket={(socket) => setGroupChatSocket(socket)}
                        socketConnect={socketConnect}
                        setSocketConnect={(socket) => setSocketConnect(socket)}
                    />
                    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                    <Component {...pageProps} />
                    <ChatBtn
                        statusSocket={statusSocket}
                        privateChatSocket={privateChatSocket}
                        groupChatSocket={groupChatSocket}
                        setStatusSocket={(socket) => setStatusSocket(socket)}
                        setPrivateChatSocket={(socket) => setPrivateChatSocket(socket)}
                        setGroupChatSocket={(socket) => setGroupChatSocket(socket)}
                        socketConnect={socketConnect}
                        setSocketConnect={(socket) => setSocketConnect(socket)}
                    />
                </PersistGate>
            </ReduxProvider>
        </>
    );
}

export default MyApp;
