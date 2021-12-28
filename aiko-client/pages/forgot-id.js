import React from 'react';
import styles from '../styles/forgot.module.css';
import Router from 'next/router';
import Image from 'next/image';
import findPic from '../public/images/question.png';
import {useState, useEffect} from 'react';
import {get, post} from '../_axios'
import router from 'next/router';

const forgotId = () => {

    //입력한 이메일
    const [email, setEmail] = useState('')
    //이메일이 발송된지 boolean check
    const [mailSent, setMailSent] = useState(undefined);
    //DB에 저장되지 않은 이메일일 때 (number)
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
        if(appCode == 100006) {
            alert('올바른 이메일이 아닙니다.');
            setAppCode(undefined);
            setEmail('');
        }
    };

    useEffect(() => {
        appCodeCheck()
    }, [checkMailSent])

    //아이디 찾기 API
    const findNickName = () => {
        const url = '/api/account/findNickname'
        const data = {
            email : email
        }
        post(url, data)
        .then((res) => {
            console.log(res);
            setMailSent(res);
            setAppCode(res.appCode)
        })
    }


    return (
        <div>
            <div className={styles.container}>
                <div className={styles.login}>
                    <div className={styles.maincontainer}>
                        <h1>FORGOT ID</h1>

                        <div className={styles.questionmark}>
                            <Image src={findPic} width={160} height={160}></Image>
                        </div>

                        <h2>
                            Enter the email address
                            <br />
                            associated with your account
                        </h2>
                        <p>We will email you a nickname</p>
                        <input className={styles.emailaddress} type='text' placeholder='Your email address'
                        value={email} onChange={typeEmail}></input>

                        <div>
                            <button onClick={findNickName} className={styles.loginbtn}>
                                SUBMIT
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default forgotId;
