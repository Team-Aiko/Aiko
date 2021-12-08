import React, { useState, useCallback, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import ChatModal from '../../ChatModal';

// * CSS Styles
const useStyles = makeStyles((theme) => ({
    absolute: {
        position: 'absolute',
        bottom: theme.spacing(2),
        right: theme.spacing(3),
    },
}));

// * Container Component
export default function CComp() {
    const userInfo = useSelector((state) => state.accountReducer);
    return <PComp userInfo={userInfo} />;
}

// * Presentational Component
function PComp(props) {
    const classes = useStyles();
    const { userInfo } = props;
    const { USER_PK } = userInfo;
    const [visibility, setVisibility] = useState(false);
    const [openChatModal, setOpenChatModal] = useState(false);

    const handleChatModal = () => {
        setOpenChatModal(true);
    };

    const handleSocket = useCallback(() => {
        const socket = io('http://localhost:5000');
        socket.emit('handleConnection', USER_PK);
        socket.on('msgToClient', (message) => {
            console.log(message);
        });
    }, [USER_PK]);

    useEffect(() => {
        handleSocket();
    }, [USER_PK]);

    return (
        <>
            {userInfo.USER_PK ? (
                <>
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
                    />
                </>
            ) : undefined}
        </>
    );
}
