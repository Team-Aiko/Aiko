import React, { useState } from 'react';
import { useRouter, push } from 'next/router';
import { CssBaseline, Button, Container, TextField, Typography } from '@material-ui/core';
import { account } from 'web-snippets';
import { post } from 'axios';
import styles from '../../styles/signup.module.css';

export default function ResetPassword() {
    const router = useRouter();
    const { uuid } = router.query;
    const [pw, setPw] = useState('');
    const [pwCf, setPwCf] = useState('');
    const [pwErr, setPwErr] = useState(false);
    const [pwCfErr, setPwCfErr] = useState(false);

    const checkValidationStrings = e => {
        const id = e.target.id;
        const text = e.target.value;
        const { isValid } = account.cValid(text, 8, 30, 'special', 'capital', 'number');

        if (id === 'pw') {
            setPw(text);
            setPwErr(!isValid);
        } else if (id === 'pwCf') {
            setPwCf(text);
            setPwCfErr(!isValid || pw !== text);
        }
    };

    const handleSubmit = () => {
        const isValid = !pwErr && !pwCfErr;

        if (isValid) {
            const packet = {
                uuid: uuid,
                password: pw,
            };
            const config = {
                header: {
                    'content-type': 'application/json',
                },
            };
            const url = '/api/account/reset-password';

            post(url, packet, config)
                .then(res => {
                    const data = res.data;
                    console.log('🚀 ~ file: [uuid].js ~ line 48 ~ handleSubmit ~ data', data);
                    data ? push('/') : undefined;
                })
                .catch(err => console.log(err));
        } else {
            alert('invalid password settings');
        }
    };

    return (
        <React.Fragment>
            <div className={styles.wrapper}>
                <div className={styles.resizing}>
                    <CssBaseline />

                    <Container maxWidth='sm'>
                        <Typography
                            component='div'
                            style={{ backgroundColor: '#FFFFFF', height: '50vh', width: '70vh' }}
                        >
                            <div className={styles.formDiv}>
                            <Typography variant="h5" display="block" align='center' gutterBottom color='primary' style={{marginTop:10}}>
                                Create a New Password
                            </Typography>
                                <TextField
                                    id='pw'
                                    label='Password'
                                    variant='outlined'
                                    size='small'
                                    error={pwErr}
                                    onChange={checkValidationStrings}
                                />
                                <TextField
                                    id='pwCf'
                                    label='Password Confirmation'
                                    variant='outlined'
                                    size='small'
                                    error={pwCfErr}
                                    onChange={checkValidationStrings}
                                />
                                <Button variant='contained' color='primary' onClick={handleSubmit} style={{marginTop:15}}>
                                    submit
                                </Button>

                                <div style={{marginTop:30}}>
                                <Typography variant="button" display="block" align='center' color='error' gutterBottom>
                                    Your password should be </Typography>
                                <Typography variant="button" display="block" align='center' gutterBottom>
                                    8 ~ 30 length, including special symbol,
                                </Typography>
                                    <Typography variant="button" display="block" align='center' gutterBottom> capital letter and number </Typography>
                                </div>
                            </div>
                        </Typography>
                    </Container>
                </div>
            </div>
        </React.Fragment>
    );
}
