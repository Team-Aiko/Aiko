import React, { useState, useCallback } from 'react';
import Router from 'next/router';
import Image from 'next/image';
import PropTypes from 'prop-types';
import io from 'socket.io-client';
import { post } from '../_axios/index';
import { useSelector, useDispatch } from 'react-redux';
import { setUserInfo } from '../_redux/accountReducer';
import { setMember, setMemberStatus, setMemberListStatus } from '../_redux/memberReducer';
import styles from '../styles/login.module.css';
import loginPic from '../public/images/image.png';
import router from 'next/router';

export default function CComp() {
    const dispatch = useDispatch();
    const setInfo = (userInfo) => {
        dispatch(setUserInfo(userInfo));
    };

    const setMemberInfo = (memberList) => {
        dispatch(setMember(memberList));
    };

    return <Login setUserInfo={setInfo} setMemberInfo={setMemberInfo} />;
}

function Login(props) {
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');

    const onChangeNickname = useCallback((e) => {
        const typedNickname = e.target.value;
        setNickname(typedNickname);
    }, []);

    const onChangePassword = useCallback((e) => {
        const typedPassword = e.target.value;
        setPassword(typedPassword);
    }, []);

    const handleLogin = () => {
        const url = '/api/account/login';
        const packet = {
            NICKNAME: nickname,
            PASSWORD: password,
        };
        const config = {
            header: {
                'content-type': 'application/json',
            },
        };

        (async () => {
            try {
                const { userInfo, statusList, memberList } = await post(url, packet, config);

                console.log('🚀 ~ file: login.js ~ line 49 ~ data', userInfo);
                if (userInfo.USER_PK) {
                    props.setUserInfo({ ...userInfo, status: 1 });

                    if (memberList.length > 0) {
                        await setMemberList(userInfo, memberList, statusList);
                    }
                    Router.push('/');
                } else {
                    alert('not valid user');
                }

                setNickname('');
                setPassword('');
                document.getElementById('id').value = '';
                document.getElementById('pw').value = '';
            } catch (err) {
                console.log(err);
            }
        })();
    };

    const open = useCallback(() => {
        Router.push('/signup');
    }, []);

    const setMemberList = (userInfo, memberList, statusList) => {
        return new Promise(function (resolve, reject) {
            const excludeMe = memberList.filter((row) => row.USER_PK !== userInfo.USER_PK);
            const setStatus = [];

            for (const status of statusList) {
                for (const member of excludeMe) {
                    if (member.USER_PK === status.userPK) {
                        setStatus.push({
                            ...member,
                            status: status.status,
                        });
                    }
                }
            }
            props.setMemberInfo(setStatus);
            resolve(setStatus);
        });
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
                            <Image className={styles.image} width={300} height={180} src={loginPic} />
                        </div>

                        <div className={styles.idpw}>
                            <h1>Log In</h1>
                            <input
                                id='id'
                                className={styles.idinput}
                                type='text'
                                placeholder='Username'
                                onChange={onChangeNickname}
                            />
                            <input
                                id='pw'
                                className={styles.pwinput}
                                type='password'
                                placeholder='Password'
                                onChange={onChangePassword}
                            />
                            <div className={styles.checkcontainer}>
                                <input className={styles.check} type='checkbox' />
                                <p className={styles.remember}>Remember Me</p>

                                <p
                                    onClick={() => {
                                        router.push('/forgot-id');
                                    }}
                                    className={styles.forgot}
                                >
                                    Forgot ID?
                                </p>
                                <p
                                    onClick={() => {
                                        router.push('/forgot-pw');
                                    }}
                                    className={styles.forgot}
                                >
                                    Forgot PW?
                                </p>
                                <div className={styles.clear} />
                            </div>
                        </div>
                    </div>

                    <div className={styles.lastcontainer}>
                        <p onKeyDown={() => {}} onClick={open} className={styles.create}>
                            Create an Account
                        </p>
                        <button type='button' className={styles.loginbtn} onClick={handleLogin}>
                            Log In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

Login.propTypes = {
    setUserInfo: PropTypes.func.isRequired,
};
