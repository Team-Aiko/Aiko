import React, { useState, useEffect } from 'react';
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
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { get, post } from '../_axios';
import { useSelector, useDispatch } from 'react-redux';

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
    const { open, onClose } = props;
    const theme = unstable_createMuiStrictModeTheme();
    const memberList = useSelector((state) => state.memberReducer);

    const statusList = [
        {
            status: -1,
            onClick: () => {
                console.log('오프라인');
            },
            color: '#ededed',
        },
        {
            status: 1,
            onClick: () => {
                console.log('온라인');
            },
            color: '#2196f3',
        },
        {
            status: 2,
            onClick: () => {
                console.log('부재중');
            },
            color: '#ffe082',
        },
        {
            status: 3,
            onClick: () => {
                console.log('바쁨');
            },
            view: '바쁨',
            color: '#e91e63',
        },
        {
            status: 4,
            onClick: () => {
                console.log('회의중');
            },
            view: '회의중',
            color: '#26a69a',
        },
    ];

    return (
        <ThemeProvider theme={theme}>
            <Dialog open={open} classes={{ paper: classes.dialogPaper }}>
                <div className={styles['member-container']}>
                    <Toolbar classes={{ root: classes.memberToolbar }}>
                        <Typography className={classes.memberTitle}>Members</Typography>
                    </Toolbar>
                    <div className={styles['member-list']}>
                        {memberList &&
                            memberList.map((member) => {
                                return (
                                    <div className={styles['member-item']} key={member.USER_PK}>
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
                                        {statusList.map((row) => {
                                            return member.status === row.status ? (
                                                <div
                                                    key={row.status}
                                                    className={styles['member-status']}
                                                    style={{ backgroundColor: row.color }}
                                                ></div>
                                            ) : null;
                                        })}
                                    </div>
                                );
                            })}
                    </div>
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
                        <TextField className={classes['inputMessage']} />
                        <Button variant='contained' color='primary'>
                            보내기
                        </Button>
                    </div>
                </div>
            </Dialog>
        </ThemeProvider>
    );
}
