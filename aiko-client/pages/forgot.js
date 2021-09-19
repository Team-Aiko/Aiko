import React from 'react';
import styles from '../styles/forgot.module.css';
import Router from 'next/router';
import Image from 'next/image';
import findPic from '../public/images/question.png';




function Forgot() {

const opencode = function() {
    Router.push('/verification');
}

  return (
    <div>
        <div className={styles.container}>
                <div className={styles.login}>
                    <div className={styles.maincontainer}>
                        <h1>FORGOT ID/PW?</h1>

                        <div className={styles.questionmark}>
                        <Image src={findPic} width={160}
                        height={160}></Image>
                        </div>

                        <h2>Enter the email address<br></br>associated with your account</h2>
                        <p>We will email you a code to reset your password</p>
                        <input className={styles.emailaddress} type="text" placeholder="Your email address"></input>
      
                        <div>
                        <button onClick={opencode} className={styles.loginbtn}>SUBMIT</button>
                        </div>
                    </div>
                </div>
        </div>
    </div>
  )

}

export default Forgot;