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
import { setMemberChatRoomPK } from '../_redux/memberReducer';
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
        textAlign: 'end',
    },
    'time-right': {
        alignSelf: 'self-start',
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
    const [status, setStatus] = useState(undefined);
    const [chatMember, setChatMember] = useState(null);
    const [selectedMember, setSelectedMember] = useState('');
    const [message, setMessage] = useState('');
    const userInfo = useSelector((state) => state.accountReducer);

    useEffect(() => {
        if (open) {
            const status = io('http://localhost:5000/private-chat');
            setStatus(status);

            const uri = '/api/account/raw-token';
            get(uri)
                .then((result) => {
                    status.emit('handleConnection', result);
                })
                .catch((err) => {
                    console.error('chat-handleConnection-error : ', err);
                });

            status.on('client/private-chat/connected', (payload) => {
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
        } else {
            status && status.emit('handleDisconnect');
        }
    }, [open]);

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
        if (message) {
            const data = {
                roomId: selectedMember.CR_PK,
                sender: userInfo.USER_PK,
                message: message,
                date: Number(moment().format('X')),
            };
            console.log('data : ', data);

            status.emit('server/private-chat/send', data);
            setMessage('');
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Dialog open={open} classes={{ paper: classes.dialogPaper }}>
                <div className={styles['member-container']}>
                    <Toolbar classes={{ root: classes.memberToolbar }}>
                        <Typography className={classes.memberTitle}>Members</Typography>
                    </Toolbar>
                    <List component='nav'>
                        {memberList &&
                            memberList.map((member) => {
                                return (
                                    <ListItem
                                        button
                                        key={member.USER_PK}
                                        style={{ justifyContent: 'space-between' }}
                                        onClick={() => setSelectedMember(member)}
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
                    <Toolbar classes={{ root: classes.toolbar }}>
                        <div className={styles['member-info']}>
                            <div className={styles['profile-image']}></div>
                            <Typography className={classes.title}>Member name</Typography>
                        </div>
                        <IconButton className={classes.closeButton} onClick={onClose}>
                            <CloseIcon className={classes.closeIcon} />
                        </IconButton>
                    </Toolbar>
                    {selectedMember ? (
                        <>
                            <div className={styles['messages-wrapper']}>
                                <div className={styles['message-wrapper']}>
                                    <Typography variant='body2'>Username</Typography>
                                    <Typography variant='body2' className={classes.message}>
                                        UI작업중입니다. '나', '상대방'에 따라 좌우 변경할 것
                                    </Typography>
                                    <Typography variant='caption' className={classes.time}>
                                        00:00
                                    </Typography>
                                </div>

                                <div className={styles['message-wrapper-right']}>
                                    <Typography variant='body2'>Username</Typography>
                                    <Typography variant='body2' className={classes['message-right']}>
                                        UI작업중입니다. '나', '상대방'에 따라 좌우 변경할 것
                                    </Typography>
                                    <Typography variant='caption' className={classes['time-right']}>
                                        00:00
                                    </Typography>
                                </div>
                            </div>
                            <div className={styles['input-message-wrapper']}>
                                <TextField
                                    className={classes['inputMessage']}
                                    onChange={(event) => {
                                        setMessage(event.target.value);
                                    }}
                                    value={message}
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
