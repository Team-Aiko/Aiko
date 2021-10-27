import React from 'react';
import styles from '../styles/components/InputModal.module.css';
import {
    Dialog,
    IconButton,
    makeStyles,
    Toolbar,
    Typography,
    ThemeProvider,
    unstable_createMuiStrictModeTheme,
    TextField,
    Button,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
    dialogPaper: {
        width: '400px',
        display: 'flex',
    },
    toolbar: {
        display: 'flex',
        padding: 0,
        position: 'relative',
    },
}));

export default function InputModal(props) {
    const classes = useStyles();
    const theme = unstable_createMuiStrictModeTheme();
    const { open, onClose, title, inputValue, onChangeInput, buttonName, handleClick, placeholder } = props;

    return (
        <ThemeProvider theme={theme}>
            <Dialog open={open} classes={{ paper: classes.dialogPaper }}>
                <Toolbar classes={{ root: classes.toolbar }}>
                    <Typography style={{ width: '100%', textAlign: 'center' }}>{title}</Typography>
                    <IconButton style={{ position: 'absolute', right: 10 }} onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Toolbar>
                <div className={styles['input-modal-container']}>
                    <TextField
                        variant='outlined'
                        size='small'
                        fullWidth
                        value={inputValue}
                        onChange={onChangeInput}
                        placeholder={placeholder}
                        autoFocus
                    />
                    <Button variant='contained' color='primary' onClick={handleClick} style={{ marginTop: '10px' }}>
                        {buttonName}
                    </Button>
                </div>
            </Dialog>
        </ThemeProvider>
    );
}
