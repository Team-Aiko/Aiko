import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import styles from '../styles/signup.module.css';
import {makeStyles} from '@material-ui/core/styles';
import {Avatar, Button, Typography, Container, TextField} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    avatarSize: {
        width: theme.spacing(7),
        height: theme.spacing(7),
    },
}));
export default function ContainerComp() {
    return <Signup />;
}

function Signup() {
    const classes = useStyles();
    return (
        <React.Fragment>
            <div className={styles.wrapper}>
                <div className={styles.resizing}>
                    <CssBaseline />
                    <Container maxWidth='sm'>
                        <Typography component='div' style={{backgroundColor: '#FFFFFF', height: '80vh', width: '70vh'}}>
                            <div className={styles.formDiv}>
                                <Avatar
                                    alt='Remy Sharp'
                                    src='../static/testImages/kotone.png'
                                    className={classes.avatarSize}
                                />
                                <TextField id='first_name' label='First name' variant='outlined' size='small' />
                                <TextField id='last_name' label='Last name' variant='outlined' size='small' />
                                <TextField id='user_name' label='Nickname' variant='outlined' size='small' />
                                <TextField id='password' label='Password' variant='outlined' size='small' />
                                <TextField
                                    id='password_cf'
                                    label='Password Confirmation'
                                    variant='outlined'
                                    size='small'
                                />
                                <TextField id='email' label='E-mail' variant='outlined' size='small' />
                                <Button variant='contained' color='primary'>
                                    Sign-up
                                </Button>
                            </div>
                        </Typography>
                    </Container>
                </div>
            </div>
        </React.Fragment>
    );
}
