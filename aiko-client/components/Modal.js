import React from 'react';
import {
    Dialog,
    IconButton,
    Toolbar,
    Typography,
    ThemeProvider,
    unstable_createMuiStrictModeTheme,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
    dialogPaper: {
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '1000px',
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    title: {
        width: '100%',
        textAlign: 'center',
    },
    closeButton: {
        position: 'absolute',
        right: 10,
    },
}));

export default function Modal(props) {
    const { open, onClose, title, children, styles } = props;
    const classes = useStyles();
    const theme = unstable_createMuiStrictModeTheme();

    return (
        <ThemeProvider theme={theme}>
            <Dialog open={open} classes={{ paper: classes.dialogPaper }} style={styles}>
                <Toolbar classes={{ root: classes.toolbar }}>
                    <Typography className={classes.title}>{title}</Typography>
                    <IconButton className={classes.closeButton} onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Toolbar>
                {children}
            </Dialog>
        </ThemeProvider>
    );
}
