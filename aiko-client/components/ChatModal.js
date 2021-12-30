import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/components/ChatModal.module.css';
import {
    Button,
    Dialog,
    IconButton,
    makeStyles,
    Toolbar,
    Typography,
    TextField,
    ThemeProvider,
    unstable_createMuiStrictModeTheme,
    Avatar,
    List,
    ListItem,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { get, post } from '../_axios';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { setMember, setMemberChatRoomPK } from '../_redux/memberReducer';
import moment from 'moment';

const useStyles = makeStyles((theme) => ({
    dialogPaper: {
        width: '700px',
        height: '600px',
        display: 'flex',
        flexDirection: 'row',
    },
    memberToolbar: {
        background: '#5c6bc0',
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        background: '#3F51B5',
    },
    memberTitle: {
        color: '#FFFFFF',
    },
    title: {
        marginLeft: '8px',
        color: '#FFFFFF',
    },
    closeIcon: {
        color: '#FFFFFF',
    },
    message: {
        background: '#f0f4c3',
        padding: '10px',
        borderRadius: '10px',
        marginTop: '4px',
    },
    'message-right': {
        background: '#FFFFFF',
        padding: '10px',
        borderRadius: '10px',
        marginTop: '4px',
    },
    time: {
        margin: '0 4px',
        flex: 'none',
    },
    inputMessage: {
        flex: 1,
        marginRight: '20px',
    },
}));

export default function ChatModal(props) {
    const classes = useStyles();
    const dispatch = useDispatch();
    const { open, onClose } = props;
    const theme = unstable_createMuiStrictModeTheme();
    const memberList = useSelector((state) => state.memberReducer);
    const statusEl = useRef(null);
    const [socket, setSocket] = useState(undefined);
    const [selectedMember, setSelectedMember] = useState('');
    const [inputMessage, setInputMessage] = useState('');
    const userInfo = useSelector((state) => state.accountReducer);
    const [messages, setMessages] = useState([]);
    const [chatMember, setChatMember] = useState([]);
    const messagesRef = useRef(null);

    useEffect(() => {
        if (open) {
            const socket = io('http://localhost:5001/private-chat', { withCredentials: true });
            setSocket(socket);

            socket.emit('handleConnection');
            socket.on('client/private-chat/connected', (payload) => {
                let newPayload = [];
                if (payload.evenCase.length > 0) {
                    const evenCase = payload.evenCase.map((row) => {
                        return {
                            ...row,
                            member: 'USER_1',
                        };
                    });
                    newPayload.push(...evenCase);
                }
                if (payload.oddCase.length > 0) {
                    const oddCase = payload.oddCase.map((row) => {
                        return {
                            ...row,
                            member: 'USER_2',
                        };
                    });
                    newPayload.push(...oddCase);
                }

                dispatch(setMemberChatRoomPK(newPayload));
            });
            socket.on('client/private-chat/receive-chatlog', (payload) => {
                setMessages(() => (payload.chatlog ? [...payload.chatlog.messages] : []));
                setChatMember(payload.info.userInfo);
            });

            socket.on('client/private-chat/send', (payload) => {
                console.log('client/private-chat/send');
                setMessages((messages) => [...messages, payload]);
                scrollToBottom();
            });
        }
    }, [open]);

    useEffect(() => {
        if (messages) {
            scrollToBottom();
        }
    }, [messages]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesRef.current?.scrollIntoView({
                behavior: 'smooth',
            });
        }, 100);
    };

    const statusList = [
        {
            status: -1,
            color: '#ededed',
        },
        {
            status: 1,
            color: '#2196f3',
        },
        {
            status: 2,
            color: '#ffe082',
        },
        {
            status: 3,
            color: '#e91e63',
        },
        {
            status: 4,
            color: '#26a69a',
        },
    ];

    const send = () => {
        if (inputMessage) {
            const data = {
                roomId: selectedMember.CR_PK,
                sender: userInfo.USER_PK,
                message: inputMessage,
                date: Number(moment().format('X')),
            };
            socket.emit('server/private-chat/send', data);
            setInputMessage('');
        }
    };

    const handleClose = () => {
        socket.emit('handleDisconnect');
        socket.disconnect();
        setSelectedMember('');
        setMessages([]);
        setChatMember([]);
        setInputMessage('');
        onClose();
    };

    const handleSelectMember = (member) => {
        setSelectedMember(member);
        socket.emit('server/private-chat/call-chatLog', member.CR_PK);
    };

    return (
        <ThemeProvider theme={theme}>
            <Dialog open={open} classes={{ paper: classes.dialogPaper }}>
                <div className={styles['member-container']}>
                    <Toolbar classes={{ root: classes.memberToolbar }}>
                        <Typography className={classes.memberTitle}>Members</Typography>
                    </Toolbar>
                    <List component='nav'>
                        {memberList.size > 0 &&
                            [...memberList.values()].map((member) => {
                                return (
                                    <ListItem
                                        button
                                        key={member.USER_PK}
                                        style={{ justifyContent: 'space-between' }}
                                        onClick={() => handleSelectMember(member)}
                                    >
                                        <div className={styles['member-user-wrapper']}>
                                            <Avatar
                                                src={
                                                    member.USER_PROFILE_PK
                                                        ? `/api/store/download-profile-file?fileId=${member.USER_PROFILE_PK}`
                                                        : null
                                                }
                                                style={{ width: '30px', height: '30px', marginRight: '4px' }}
                                            />
                                            <Typography>{member.NICKNAME}</Typography>
                                        </div>
                                        {statusList.map((row, index) => {
                                            return member.status === row.status ? (
                                                <div
                                                    ref={statusEl}
                                                    key={row.status}
                                                    className={styles['member-status']}
                                                    style={{ backgroundColor: row.color }}
                                                ></div>
                                            ) : null;
                                        })}
                                    </ListItem>
                                );
                            })}
                    </List>
                </div>

                <div className={styles['message-container']}>
                    <Toolbar
                        classes={{ root: classes.toolbar }}
                        style={{ justifyContent: selectedMember ? 'space-between' : 'flex-end' }}
                    >
                        {selectedMember && (
                            <div className={styles['member-info']}>
                                <Avatar
                                    src={
                                        selectedMember.USER_PROFILE_PK
                                            ? `/api/store/download-profile-file?fileId=${selectedMember.USER_PROFILE_PK}`
                                            : null
                                    }
                                    style={{ width: '40px', height: '40px', marginRight: '4px' }}
                                />
                                <Typography className={classes.title}>{selectedMember.NICKNAME}</Typography>
                            </div>
                        )}

                        <IconButton className={classes.closeButton} onClick={handleClose}>
                            <CloseIcon className={classes.closeIcon} />
                        </IconButton>
                    </Toolbar>
                    {selectedMember ? (
                        <>
                            <div className={styles['messages-wrapper']}>
                                {messages &&
                                    messages.map((message, index) => {
                                        return (
                                            <div
                                                key={message.date}
                                                className={styles['message-item']}
                                                ref={messagesRef}
                                            >
                                                {index === 0 ||
                                                (index > 0 &&
                                                    moment.unix(messages[index - 1].date).format('YYYY-MM-DD') !==
                                                        moment.unix(messages[index].date).format('YYYY-MM-DD')) ? (
                                                    <Typography
                                                        variant='body2'
                                                        align='center'
                                                        color='primary'
                                                        style={{ margin: '40px 0 0' }}
                                                    >
                                                        {moment.unix(message.date).format('LL')}
                                                    </Typography>
                                                ) : null}
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection:
                                                            message.sender !== userInfo.USER_PK ? 'row' : 'column',
                                                    }}
                                                >
                                                    {message.sender !== userInfo.USER_PK && (
                                                        <Avatar
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                margin: '10px 8px 0 0',
                                                            }}
                                                            src={
                                                                chatMember.USER_PROFILE_PK
                                                                    ? `/api/store/download-profile-file?fileId=${chatMember.USER_PROFILE_PK}`
                                                                    : null
                                                            }
                                                        />
                                                    )}
                                                    <div
                                                        className={
                                                            message.sender !== userInfo.USER_PK
                                                                ? styles['message-wrapper']
                                                                : styles['message-wrapper-right']
                                                        }
                                                    >
                                                        {message.sender === chatMember.USER_PK ? (
                                                            <Typography variant='body2'>
                                                                {chatMember.NICKNAME}
                                                            </Typography>
                                                        ) : null}
                                                        <div
                                                            className={
                                                                message.sender !== userInfo.USER_PK
                                                                    ? styles.contents
                                                                    : styles['contents-right']
                                                            }
                                                        >
                                                            <Typography
                                                                variant='body2'
                                                                className={
                                                                    message.sender !== userInfo.USER_PK
                                                                        ? classes.message
                                                                        : classes['message-right']
                                                                }
                                                                display='inline'
                                                            >
                                                                {message.message}
                                                            </Typography>
                                                            <Typography variant='caption' className={classes.time}>
                                                                {moment.unix(message.date).format('LT')}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                            <div className={styles['input-message-wrapper']}>
                                <TextField
                                    className={classes['inputMessage']}
                                    onChange={(event) => {
                                        setInputMessage(event.target.value);
                                    }}
                                    value={inputMessage}
                                />
                                <Button variant='contained' color='primary' onClick={send}>
                                    보내기
                                </Button>
                            </div>
                        </>
                    ) : null}
                </div>
            </Dialog>
        </ThemeProvider>
    );
}
