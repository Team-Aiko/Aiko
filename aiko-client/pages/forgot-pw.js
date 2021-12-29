import React from 'react';
import styles from '../styles/forgot.module.css';
import Router from 'next/router';
import Image from 'next/image';
import findPic from '../public/images/question.png';
import {useState} from 'react';
import {post} from '../_axios'

const forgotPw = () => {

    const [email, setEmail] = useState('');

    const emailChange = (e) => {
        setEmail(e.target.value)
    }

    const askResetPw = () => {
        const url = '/api/account/requesting-reset-password';
        const data = {
            email:email
        }
        post(url, data)
        .then((res) => {
            console.log(res);
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

                        <input value={email} onChange={emailChange}></input>

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
