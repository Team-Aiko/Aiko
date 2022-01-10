import React from 'react';
import styles from '../styles/forgot.module.css';
import Router from 'next/router';
import Image from 'next/image';
import findPic from '../public/images/question.png';
import {useState, useEffect} from 'react';
import {post} from '../_axios';
import router from 'next/router';

const forgotPw = () => {

    const [email, setEmail] = useState('');
    const [mailSent, setMailSent] = useState(undefined);
    const [appCode, setAppCode] = useState(undefined);

    const typeEmail = (e) => {
        setEmail(e.target.value)
    };

    const checkMailSent = () => {
        if (mailSent == true) {
            alert('아이디가 이메일로 발송됐습니다.');
            setEmail('');
            router.push('/login')
        }
    };

    useEffect(() => {
        checkMailSent()
    }, [mailSent])

    const appCodeCheck = () => {
        if(appCode == 100007) {
            alert('입력한 이메일을 확인해주세요.');
            setAppCode(undefined);
            setEmail('');
        }
    };

    useEffect(() => {
        appCodeCheck()
    }, [checkMailSent])

    const askResetPw = () => {
        const url = '/api/account/requesting-reset-password';
        const data = {
            email:email
        }
        post(url, data)
        .then((res) => {
            console.log('^^' + JSON.stringify(res));
            setMailSent(res);
            setAppCode(res.appCode)
        })
        .catch((error) => {
            console.log(error)
        })
    };

    return (
        <div>
            <div className={styles.container}>
                <div className={styles.login}>
                    <div className={styles.maincontainer}>
                        <h1>FORGOT PASSWORD</h1>

                        <div className={styles.questionmark}>
                            <Image src={findPic} width={160} height={160}></Image>
                        </div>

                        <h2>
                            Enter the email address
                            <br />
                            associated with your account
                        </h2>
                        <p>We will email you with an address where you can reset password.</p>

                        <input className={styles.emailaddress} type='text' placeholder='Your email address'
                        value={email} onChange={typeEmail}></input>

                        <div>
                            <button className={styles.loginbtn} onClick={askResetPw}>
                                SUBMIT
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default forgotPw;
