import React from 'react';
import styles from '../styles/components/ChatModal.module.css';
import { Button, Dialog, IconButton, makeStyles, Toolbar, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
    dialogPaper: {
        width: '400px',
        height: '600px',
        display: 'flex',
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
    },
}));

export default function ChatModal(props) {
    const classes = useStyles();
    const { open, onClose } = props;

    return (
        <Dialog open={open} classes={{ paper: classes.dialogPaper }}>
            <Toolbar classes={{ root: classes.toolbar }}>
                <div className={styles['member-info']}>
                    <div className={styles['profile-image']}></div>
                    <Typography style={{ marginLeft: '4px' }}>Member name</Typography>
                </div>
                <Button onClick={onClose}>나가기</Button>
            </Toolbar>
        </Dialog>
    );
}
