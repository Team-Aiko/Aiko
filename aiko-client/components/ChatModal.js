import React from 'react';
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
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

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

    return (
        <ThemeProvider theme={theme}>
            <Dialog open={open} classes={{ paper: classes.dialogPaper }}>
                <div className={styles['member-container']}>
                    <Toolbar classes={{ root: classes.memberToolbar }}>
                        <Typography className={classes.memberTitle}>Members</Typography>
                    </Toolbar>
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
