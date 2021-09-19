import React from 'react';
import styles from '../styles/verification.module.css';
import Image from 'next/image';
import Hook from '../public/images/hook.png';
import TextField from '@material-ui/core/TextField';

const Verification = () => {
    return (
        <div>
            <div className={styles.container}>
                <div className={styles.whitecontainer}>
                    <h1>FORGOT ID/PW?</h1>
                    
                    <div className={styles.questionmark}>
                    <Image src={Hook} width={160}
                    height={160}></Image>
                    </div>

                    <h2>Enter the verification code<br/>we just sent you on your email</h2>


                    <div className={styles.buttons}>
                    <input className={styles.pincode} type="password" maxLength='1'></input>
                    <input className={styles.pincode} type="password" maxLength='1'></input>
                    <input className={styles.pincode} type="password" maxLength='1'></input>
                    <input className={styles.pincode} type="password" maxLength='1'></input>
                    </div>

                    <div>
                    <button className={styles.loginbtn}>SUBMIT</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Verification
