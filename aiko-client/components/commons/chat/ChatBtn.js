import React, { useState, useCallback, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import { useSelector } from 'react-redux';
import ChatModal from '../../ChatModal';
import { ThemeProvider, unstable_createMuiStrictModeTheme } from '@material-ui/core';

// * CSS Styles
const useStyles = makeStyles((theme) => ({
    absolute: {
        position: 'absolute',
        bottom: theme.spacing(2),
        right: theme.spacing(3),
    },
}));

// * Container Component
export default function ChatBtn({
    statusSocket,
    privateChatSocket,
    groupChatSocket,
    setStatusSocket,
    setPrivateChatSocket,
    setGroupChatSocket,
    socketConnect,
    setSocketConnect,
}) {
    const userInfo = useSelector((state) => state.accountReducer);
    const theme = unstable_createMuiStrictModeTheme();
    const classes = useStyles();
    const { USER_PK } = userInfo;
    const [openChatModal, setOpenChatModal] = useState(false);

    const handleChatModal = () => {
        setOpenChatModal(true);
    };

    return USER_PK ? (
        <>
            <ThemeProvider theme={theme}>
                <Tooltip title='Add' aria-label='chat' onClick={handleChatModal}>
                    <Fab color='secondary' className={classes.absolute}>
                        <AddIcon />
                    </Fab>
                </Tooltip>
                <ChatModal
                    open={openChatModal}
                    onClose={() => {
                        setOpenChatModal(false);
                    }}
                    statusSocket={statusSocket}
                    privateChatSocket={privateChatSocket}
                    groupChatSocket={groupChatSocket}
                    setStatusSocket={(socket) => setStatusSocket(socket)}
                    setPrivateChatSocket={(socket) => setPrivateChatSocket(socket)}
                    setGroupChatSocket={(socket) => setGroupChatSocket(socket)}
                    socketConnect={socketConnect}
                    setSocketConnect={(socket) => setSocketConnect(socket)}
                />
            </ThemeProvider>
        </>
    ) : (
        <></>
    );
}
