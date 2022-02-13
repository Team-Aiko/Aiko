import React, { useState, useCallback, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
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
export default function ChatBtn(props) {
    const userInfo = useSelector((state) => state.accountReducer);
    const theme = unstable_createMuiStrictModeTheme();
    const classes = useStyles();
    const { privateSocket, groupSocket } = props;
    const { USER_PK } = userInfo;
    const [openChatModal, setOpenChatModal] = useState(false);

    useEffect(() => {
        if (USER_PK && privateSocket && groupSocket) {
            console.log('###ChatBtn : socket O');

            privateSocket.emit('handleConnection');
            groupSocket.emit('handleConnection');
        }
    }, [USER_PK]);

    const handleChatModal = () => {
        setOpenChatModal(true);
    };

    // const handleSocket = useCallback(() => {
    //     const socket = io('http://localhost:5001');
    //     socket.emit('handleConnection', USER_PK);
    //     socket.on('msgToClient', (message) => {
    //         console.log('message : ', message);
    //     });
    // }, [USER_PK]);

    // useEffect(() => {
    //     handleSocket();
    // }, [USER_PK]);

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
                    privateSocket={privateSocket}
                    groupSocket={groupSocket}
                />
            </ThemeProvider>
        </>
    ) : (
        <></>
    );
}
