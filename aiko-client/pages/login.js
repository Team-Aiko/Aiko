import React, { useState, useCallback } from 'react';
import styles from '../styles/login.module.css';
import Image from 'next/image';
import loginPic from '../public/images/image.png';
import Router from 'next/router';
import { post } from 'axios';
import { setUserInfo } from '../_redux/accountReducer';
import { useSelector, useDispatch } from 'react-redux';

export default function CComp() {
    const dispatch = useDispatch();
    const setInfo = userInfo => {
        dispatch(setUserInfo(userInfo));
    };
    return <Login setUserInfo={setInfo} />;
}

function Login(props) {
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');

    const onChangeNickname = useCallback(e => {
        const typedNickname = e.target.value;
        setNickname(typedNickname);
    }, []);

    const onChangePassword = useCallback(e => {
        const typedPassword = e.target.value;
        setPassword(typedPassword);
    }, []);

    const handleLogin = () => {
        const url = '/api/account/login';
        const data = {
            NICKNAME: nickname,
            PASSWORD: password,
        };
        const config = {
            header: {
                'content-type': 'application/json',
            },
        };

        post(url, data, config)
            .then(res => {
                const data = res.data;
                if (data.header /*login result : boolean*/) {
                    console.log('대체 머선129');
                    props.setUserInfo({
                        USER_PK: data.USER_PK,
                        NICKNAME: data.NICKNAME,
                        COMPANY_PK: data.COMPANY_PK,
                    });
                    Router.push('/');
                } else {
                    alert('not valid user');
                }

                setNickname('');
                setPassword('');
                document.getElementById('id').value = '';
                document.getElementById('pw').value = '';
            })
            .catch(err => console.log(err));
    };

    const open = useCallback(function () {
        Router.push('/signup');
    }, []);

    const find = function () {
        Router.push('/forgot');
    };

    return (
        <div>
            <div className={styles.container}>
                <div className={styles.login}>
                    <div className={styles.name}>
                        <h1>AIKO</h1>
                    </div>

                    <div className={styles.logincontainer}>
                        <div className={styles.account}>
                            <Image className={styles.image} width={300} height={180} src={loginPic}></Image>
                        </div>

                        <div className={styles.idpw}>
                            <h1>Log In</h1>
                            <input
                                id='id'
                                className={styles.idinput}
                                type='text'
                                placeholder='Username'
                                onChange={onChangeNickname}
                            ></input>
                            <input
                                id='pw'
                                className={styles.pwinput}
                                type='password'
                                placeholder='Password'
                                onChange={onChangePassword}
                            ></input>
                            <div className={styles.checkcontainer}>
                                <input className={styles.check} type='checkbox'></input>
                                <p className={styles.remember}>Remember Me</p>
                                <p onClick={find} className={styles.forgot}>
                                    Forgot ID/PW?
                                </p>
                                <div className={styles.clear}></div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.lastcontainer}>
                        <p onClick={open} className={styles.create}>
                            Create an Account
                        </p>
                        <button className={styles.loginbtn} onClick={handleLogin}>
                            Log In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
