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
    Tab,
    Tabs,
    Icon,
    Grid,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { get, post } from '../_axios';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { setMember, setMemberChatRoomPK } from '../_redux/memberReducer';
import moment from 'moment';
import PersonIcon from '@material-ui/icons/Person';
import PeopleIcon from '@material-ui/icons/PeopleAlt';
import AddIcon from '@material-ui/icons/Add';
import SearchMemberModal from './SearchMemberModal';
import Modal from './Modal';

const useStyles = makeStyles((theme) => ({
    dialogPaper: {
        maxWidth: '800px',
        width: '800px',
        height: '600px',
        display: 'flex',
        flexDirection: 'row',
    },
    memberToolbar: {
        background: '#5c6bc0',
        display: 'flex',
        justifyContent: 'space-between',
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

export default function ChatModal({
    open,
    onClose,
    statusSocket,
    privateChatSocket,
    groupChatSocket,
    setStatusSocket,
    setPrivateChatSocket,
    setGroupChatSocket,
    socketConnect,
    setSocketConnect,
}) {
    const classes = useStyles();
    const dispatch = useDispatch();
    const theme = unstable_createMuiStrictModeTheme();
    const memberList = useSelector((state) => state.memberReducer);
    const statusEl = useRef(null);
    const [selectedMember, setSelectedMember] = useState('');
    const [inputMessage, setInputMessage] = useState('');
    const userInfo = useSelector((state) => state.accountReducer);
    const [messages, setMessages] = useState([]);
    const [chatMember, setChatMember] = useState([]);
    const messagesRef = useRef(null);
    const [inputMember, setInputMember] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [openSearchMemberModal, setOpenSearchMemberModal] = useState(false);
    const [groupChatMember, setGroupChatMember] = useState([]);
    const [openAddGroup, setOpenAddGroup] = useState(false);
    const [groupChatTitle, setGroupChatTitle] = useState('');
    const [groupChatList, setGroupChatList] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');

    const statusConnect = socketConnect.status;
    const privateConnect = socketConnect.private;

    useEffect(() => {
        console.log(statusConnect);
        if (statusConnect) {
            const privateChatSocket = io('http://localhost:5001/private-chat', {
                withCredentials: true,
                autoConnect: false,
            });
            setPrivateChatSocket(privateChatSocket);
            const uri = '/api/account/temp-socket-token';
            get(uri)
                .then((result) => {
                    if (result) {
                        privateChatSocket.on('connect', async function () {
                            console.log('private chat result : ', result);
                            privateChatSocket.emit('handleConnection', result);
                            console.log('Called!! - private chat : ', result);
                        });
                        privateChatSocket.open();
                    }
                    privateChatSocket.on('disconnect', function () {
                        console.log('private chat disconnect!!!');
                        setSocketConnect({
                            ...socketConnect,
                            private: false,
                        });
                    });

                    privateChatSocket.on('client/private-chat/connected', (payload) => {
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
                        console.log('### privat-chat/connected : ', newPayload);
                        setSocketConnect({
                            ...socketConnect,
                            private: true,
                        });
                    });

                    privateChatSocket.on('client/private-chat/receive-chatlog', (payload) => {
                        console.log('client/private-chat/receive-chatlog : ', payload);
                        setMessages(() => (payload.chatlog ? [...payload.chatlog.messages] : []));
                        setChatMember(payload.info.userInfo);
                    });

                    privateChatSocket.on('client/private-chat/send', (payload) => {
                        console.log('client/private-chat/send');
                        setMessages((messages) => [...messages, payload]);
                        scrollToBottom();
                    });
                    privateChatSocket.on('client/private-chat/logoutEventExecuted', () => {
                        console.log('private-logout');
                        privateChatSocket.emit('handleDisconnect');
                    });
                })
                .catch((err) => {
                    console.error('privateChat handleConnection - error : ', err);
                });
        }
    }, [statusConnect]);

    useEffect(() => {
        if (privateConnect) {
            const groupChatSocket = io('http://localhost:5001/group-chat', {
                withCredentials: true,
                autoConnect: false,
            });
            setGroupChatSocket(groupChatSocket);
            const uri = '/api/account/temp-socket-token';
            get(uri)
                .then((result) => {
                    if (result) {
                        groupChatSocket.on('connect', async function () {
                            console.log('group chat result : ', result);
                            groupChatSocket.emit('handleConnection', result);
                            console.log('Called!! - group chat : ', result);
                        });
                        groupChatSocket.open();

                        privateChatSocket.on('disconnect', function () {
                            console.log('group chat disconnect!!!');
                            setSocketConnect({
                                ...socketConnect,
                                group: false,
                            });
                        });

                        groupChatSocket.on('client/gc/connected', (payload) => {
                            console.log('/client/gc/connected : ', payload);
                            setGroupChatList(payload);
                        });
                        groupChatSocket.on('client/gc/join-room-notice', (payload) => {
                            console.log('/client/gc/join-room-notice : ', payload);
                            groupChatSocket.emit('server/gc/join-group-chat-room', payload.GC_PK);
                            setGroupChatList((groupChatList) => [
                                ...groupChatList,
                                {
                                    GC_PK: payload.GC_PK,
                                    MAX_NUM: payload.maxNum,
                                    ROOM_ADMIN: payload.admin,
                                    ROOM_TITLE: payload.roomTitle,
                                    members: payload.memberList,
                                },
                            ]);
                        });
                        groupChatSocket.on('client/gc/joined_gcr', (payload) => {
                            console.log('client/gc/joined_gcr', payload);
                        });
                        groupChatSocket.on('client/gc/read-chat-logs', (payload) => {
                            console.log('/client/gc/read-chat-logs : ', payload);
                            console.log('group read : ', payload.userMap);
                        });
                        groupChatSocket.on('client/gc/logoutEventExecuted', () => {
                            console.log('gc logout');
                            groupChatSocket.emit('handleDisconnect');
                        });
                    }
                })
                .catch((err) => {
                    console.error('groupChat handleConnection - error : ', err);
                });
        }
    }, [privateConnect]);

    useEffect(() => {
        setSelectedMember('');
    }, [tabValue]);

    useEffect(() => {
        if (messages) {
            scrollToBottom();
        }
    }, [messages]);

    useEffect(() => {
        if (inputMember) {
            searchMember();
        } else {
            setSearchResults([]);
        }
    }, [inputMember]);

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
            privateChatSocket.emit('server/private-chat/send', data);
            setInputMessage('');
        }
    };

    const handleClose = () => {
        setSelectedMember('');
        setMessages([]);
        setChatMember([]);
        setInputMessage('');
        onClose();
    };

    const handleSelectMember = (member) => {
        setSelectedMember(member);
        privateChatSocket.emit('server/private-chat/call-chatLog', member.CR_PK);
    };

    const searchMember = () => {
        let filter = [];
        memberList.forEach((value) => {
            if (value.NICKNAME.includes(inputMember)) {
                filter.push(value);
            }
        });

        setSearchResults(filter);
    };

    const handleKeyPress = (event) => {
        if (event.target.value && event.key === 'Enter') {
            send();
        }
    };

    const handleTab = (event, value) => {
        setTabValue(value);
    };

    const handleAddGroup = () => {
        setOpenAddGroup(true);
    };

    const removeMember = (index) => {
        const memberList = [...groupChatMember];
        memberList.splice(index, 1);
        setGroupChatMember(memberList);
    };

    const handleCreateGroupChat = () => {
        if (!groupChatTitle) {
            return alert('룸 제목을 입력하세요.');
        }
        if (groupChatMember.length === 0) {
            return alert('참여 멤버를 추가하세요.');
        }
        const memberList = groupChatMember.map((user) => user.USER_PK);
        const data = {
            userList: [userInfo.USER_PK, ...memberList],
            admin: userInfo.USER_PK,
            roomTitle: groupChatTitle,
            maxNum: groupChatMember.length + 1,
        };
        console.log('data : ', data);
        groupChatSocket.emit('server/gc/create-group-chat-room', data);
        setOpenAddGroup(false);
    };

    const handleSelectGroup = (group) => {
        setSelectedGroup(group);
        groupChatSocket.emit('server/gc/read-chat-logs', group.GC_PK);
    };

    return (
        <ThemeProvider theme={theme}>
            <Dialog open={open} classes={{ paper: classes.dialogPaper }}>
                <div className={styles.tabs}>
                    <Tabs orientation='vertical' style={{ marginTop: '64px' }} value={tabValue} onChange={handleTab}>
                        <Tab label={<PersonIcon style={{ fill: '#FFFFFF' }} />} style={{ minWidth: 0 }} />
                        <Tab label={<PeopleIcon style={{ fill: '#FFFFFF' }} />} style={{ minWidth: 0 }} />
                    </Tabs>
                </div>
                {tabValue === 0 ? (
                    <div className={styles['member-container']}>
                        <Toolbar classes={{ root: classes.memberToolbar }}>
                            <Typography className={classes.memberTitle}>Members</Typography>
                        </Toolbar>
                        <div className={styles['member-search']}>
                            <TextField
                                label='검색'
                                variant='outlined'
                                fullWidth
                                size='small'
                                value={inputMember}
                                onChange={(e) => setInputMember(e.target.value)}
                            />
                        </div>
                        <List component='nav'>
                            {searchResults.length > 0
                                ? searchResults.map((member) => {
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
                                  })
                                : memberList &&
                                  memberList.map((member) => {
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
                ) : (
                    <div className={styles['member-container']}>
                        <Toolbar classes={{ root: classes.memberToolbar }}>
                            <Typography className={classes.memberTitle}>Groups</Typography>
                            <IconButton onClick={handleAddGroup}>
                                <AddIcon style={{ fill: '#FFFFFF' }} />
                            </IconButton>
                        </Toolbar>
                        <List component='nav'>
                            {groupChatList.length > 0
                                ? groupChatList.map((groupChat) => {
                                      return (
                                          <ListItem
                                              button
                                              key={groupChat.GC_PK}
                                              onClick={() => handleSelectGroup(groupChat)}
                                          >
                                              <Typography>{groupChat.ROOM_TITLE}</Typography>
                                          </ListItem>
                                      );
                                  })
                                : null}
                        </List>
                        <Modal
                            open={openAddGroup}
                            onClose={() => {
                                setOpenAddGroup(false);
                            }}
                            title='그룹 채팅룸 만들기'
                        >
                            <Grid container spacing={2} style={{ padding: '20px', maxWidth: '460px', width: '100%' }}>
                                <Grid item xs={3}>
                                    <Typography>룸 제목</Typography>
                                </Grid>
                                <Grid item xs={9}>
                                    <TextField
                                        variant='outlined'
                                        fullWidth
                                        size='small'
                                        onChange={(e) => {
                                            setGroupChatTitle(e.target.value);
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography>참여 멤버</Typography>
                                </Grid>
                                <Grid item xs={9} style={{ display: 'flex', alignItems: 'center' }}>
                                    {groupChatMember.length > 0 ? (
                                        <div className={styles['selected-user-list']}>
                                            {groupChatMember.map((member, index) => {
                                                return (
                                                    <div
                                                        className={styles['user-wrapper']}
                                                        key={member.user ? member.user.USER_PK : member.USER_PK}
                                                    >
                                                        <Typography variant='body2'>
                                                            {member.user ? member.user.NICKNAME : member.NICKNAME}
                                                        </Typography>
                                                        <IconButton
                                                            style={{ width: '20px', height: '20px', marginLeft: '8px' }}
                                                            onClick={() => removeMember(index)}
                                                        >
                                                            <CloseIcon />
                                                        </IconButton>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : null}
                                    <Button
                                        variant='contained'
                                        color='primary'
                                        onClick={() => {
                                            setOpenSearchMemberModal(true);
                                        }}
                                    >
                                        추가
                                    </Button>
                                </Grid>
                                <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Button variant='contained' color='primary' onClick={handleCreateGroupChat}>
                                        만들기
                                    </Button>
                                </Grid>
                            </Grid>
                        </Modal>
                        <SearchMemberModal
                            open={openSearchMemberModal}
                            onClose={() => {
                                setOpenSearchMemberModal(false);
                            }}
                            onClickSelectedUserList={(user) => {
                                setGroupChatMember((groupChatMember) => [...groupChatMember, ...user]);
                                setOpenSearchMemberModal(false);
                            }}
                            title='그룹 채팅 멤버 선택'
                            multipleSelection={true}
                        />
                    </div>
                )}

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
                                    onKeyPress={(event) => {
                                        handleKeyPress(event);
                                    }}
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
