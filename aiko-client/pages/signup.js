import React, {useState} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import styles from '../styles/signup.module.css';
import {makeStyles} from '@material-ui/core/styles';
import {Avatar, Button, Typography, Container, TextField} from '@material-ui/core';
import {files, account} from 'web-snippets';
import {get, post} from 'axios';

const useStyles = makeStyles(theme => ({
    avatarStyle: {
        width: theme.spacing(10),
        height: theme.spacing(10),
        cursor: 'pointer',
    },
}));
export default function ContainerComp() {
    return <Signup />;
}

function Signup() {
    const [image, setImage] = useState('../static/testImages/kotone.png');
    const [step, setStep] = useState(0);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const [pwCf, setPwCf] = useState('');
    const [errFirstName, setErrFirstName] = useState(false);
    const [errLastName, setErrLastName] = useState(false);
    const [errNickname, setErrNickname] = useState(false);
    const [errPw, setErrPw] = useState(false);
    const [errPwCf, setErrPwCf] = useState(false);
    const [errEmail, setErrEmail] = useState(false);
    const [bundle, setBundle] = useState({});
    const classes = useStyles();

    const handleFileUploader = () => {
        const uploader = document.getElementById('profileFile');
        uploader.click();
    };

    const handleFileChange = () => {
        const uploader = document.getElementById('profileFile');
        const fileName = uploader.files[0].name;
        const fileSize = uploader.files[0].size;
        const {isValid, errMessage} = files.imageValid(uploader.files[0], '3mb');

        if (isValid) {
            const imageURL = URL.createObjectURL(uploader.files[0]);
            setImage(imageURL);
        }
    };

    const checkValidationStrings = e => {
        const str = e.target.value;
        const id = e.target.id;

        const {isValid} = account.cValid(str, 0, 30);

        if (id === 'first_name') {
            if (isValid) {
                setFirstName(str);
                setErrFirstName(false);
            } else {
                alert('Maximum count: 30 or Minimum Count: 1');
                setErrFirstName(true);
            }
        }

        if (id === 'last_name') {
            if (isValid) {
                setLastName(str);
                setErrLastName(false);
            } else {
                alert('Maximum count: 30 or Minimum Count: 1');
                setErrLastName(true);
            }
        }
    };

    const checkValidationPw = e => {
        const pw = e.target.value;
        const {isValid, errMessage} = account.cValid(pw, 8, 30, ['special, capital, number']);

        if (isValid) {
            setPw(pw);
            setErrPw(false);
        } else {
            alert(errMessage);
            setErrPw(true);
        }
    };

    const checkValidationPwCf = e => {
        const typedPwCf = e.target.value;
        const isValid = account.confirmPw(pw, typedPwCf);

        isValid ? errPwCf(false) : errPwCf(true);

        setPwCf(typedPwCf);
    };

    const checkValidationEmail = e => {
        const typedEmail = e.target.value;
        const isValid = account.emailValid(typedEmail);

        isValid ? setErrEmail(false) : setErrEmail(true);

        setEmail(typedEmail);
    };

    const checkValidationNickname = e => {
        const typedNickname = e.target.value;
        console.log('🚀 ~ file: signup.js ~ line 115 ~ Signup ~ typedNickname', typedNickname);
        const url = '/api/account/checkDuplicateNickname?nickname=' + typedNickname;

        get(url)
            .then(res => {
                const data = res.data;
                console.log('🚀 ~ file: signup.js ~ line 120 ~ Signup ~ data', data);
            })
            .catch(e => console.log(e));
    };

    const handleSteps = step => {
        setStep(step);
    };

    return (
        <React.Fragment>
            <div className={styles.wrapper}>
                <div className={styles.resizing}>
                    <CssBaseline />
                    <Container maxWidth='sm'>
                        <Typography component='div' style={{backgroundColor: '#FFFFFF', height: '85vh', width: '70vh'}}>
                            <div className={styles.formDiv}>
                                <Avatar
                                    alt='Profile Image Preview'
                                    src={image}
                                    className={classes.avatarStyle}
                                    onClick={handleFileUploader}
                                />
                                <TextField
                                    id='first_name'
                                    label='First name'
                                    variant='outlined'
                                    size='small'
                                    error={errFirstName}
                                    onChange={checkValidationStrings}
                                />
                                <TextField
                                    id='last_name'
                                    label='Last name'
                                    variant='outlined'
                                    size='small'
                                    error={errLastName}
                                    onChange={checkValidationStrings}
                                />
                                <TextField
                                    id='user_name'
                                    label='Nickname'
                                    variant='outlined'
                                    size='small'
                                    error={errNickname}
                                    onChange={checkValidationNickname}
                                />
                                <TextField
                                    type='password'
                                    id='password'
                                    label='Password'
                                    variant='outlined'
                                    error={errPw}
                                    size='small'
                                    onChange={checkValidationPw}
                                />
                                <TextField
                                    type='password'
                                    id='password_cf'
                                    label='Password Confirmation'
                                    variant='outlined'
                                    error={errPwCf}
                                    size='small'
                                    onChange={checkValidationPwCf}
                                />
                                <TextField
                                    id='email'
                                    label='E-mail'
                                    variant='outlined'
                                    size='small'
                                    error={errEmail}
                                    onChange={checkValidationEmail}
                                />
                                <Button
                                    variant='contained'
                                    color='primary'
                                    onClick={() => {
                                        handleSteps(1);
                                    }}
                                >
                                    Next
                                </Button>
                            </div>
                        </Typography>
                    </Container>
                </div>
            </div>
            <input type='file' name='file' id='profileFile' style={{display: 'none'}} onChange={handleFileChange} />
        </React.Fragment>
    );
}
