import React, { useState, useEffect } from 'react';
import { useRouter, push, router } from 'next/router';
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

    const [isChanged, setIsChanged] = useState(false);
    const [isCl, setIsCl] = useState(false);
    const [timeoutId, setTimeoutId] = useState(0)

    useEffect(() => {
        if(isCl) {
            let timeIdx = setTimeout(() => {
                setIsCl(false);
                clearTimeout(timeIdx);
                setTimeoutId(false);
            }, 2000)
        }
    }, [isCl])

    const onKeyDownHandler = (e) => {
        let isCapsLock = e.getModifierState('CapsLock');
        setIsCl(isCapsLock)
    }

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
                    setIsChanged(res.data.result);
                    setPw('');
                    setPwCf('')
                })
                .catch(err => console.log(err));
        } else {
            alert('비밀번호를 다시 설정해주세요.');
        }
    };

    const completeChange = () => {
        if(isChanged == true) {
            alert('비밀번호가 변경되었습니다. 다시 로그인 해주세요.');
            router.push('/login');
        }
    }

    useEffect(() => {
        completeChange()
    }, [isChanged])


    return (
        <React.Fragment>
            <div className={styles.wrapper}>
                <div className={styles.resizing}>
                    <CssBaseline />

                    <Container maxWidth='sm'>
                        <Typography
                            component='div'
                            style={{ backgroundColor: '#FFFFFF', height: '50vh', width: '70vh', borderRadius:'10px' }}
                        >
                            <div className={styles.formDiv}>

                                <div style={{display:'flex', alignItems:'center', width:'50%', height:'40px', justifyContent:'space-around'}}>
                                <h3 style={{color:'#3f51b5'}}>Aiko</h3>
                            <Typography color='textSecondary'>
                            New Password
                            </Typography>
                                </div>
                            
                                <TextField
                                    id='pw'
                                    label='Password'
                                    variant='outlined'
                                    size='small'
                                    error={pwErr}
                                    type='password'
                                    onChange={checkValidationStrings}
                                    onKeyDown={onKeyDownHandler}
                                />
                                <TextField
                                    id='pwCf'
                                    label='Password Confirmation'
                                    variant='outlined'
                                    size='small'
                                    type='password'
                                    error={pwCfErr}
                                    onChange={checkValidationStrings}
                                    onKeyDown={onKeyDownHandler}
                                />
                                {
                                    isCl ? <Typography variant="button" display="block" align='center' type='caption' color='textSecondary'>CapsLock키가 활성화되어있습니다.</Typography>: <></>
                                }
                                <Button variant='contained' color='primary' onClick={handleSubmit}>
                                    submit
                                </Button>

                                <div style={{marginTop:20}}>
                                <Typography variant="button" display="block" align='center' gutterBottom
                                className={!pwErr && !pwCfErr ? styles.noWarn : styles.warn}>
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
