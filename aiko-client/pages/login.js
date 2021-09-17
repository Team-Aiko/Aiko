import React from 'react'
import styles from '../styles/login.module.css'
import Image from 'next/image'
import loginPic from '../public/images/image.png';
import Router from 'next/router';

const login = () => {

const open = function() {
    Router.push('/signup');
};

return (
        <div>
            <div className={styles.container}>
                <div className={styles.login}>
                    <div className={styles.name}><h1>AIKO</h1></div>
                    
                    <div className={styles.logincontainer}>
                        <div className={styles.account}>
                            <Image className={styles.image} width={300}
                             height={180} src={loginPic}></Image>
                        </div>

                        <div className={styles.idpw}>
                            <h1>Log In</h1>
                            <input className={styles.idinput} type="text" placeholder="Username"></input>
                            <input className={styles.pwinput} type="text" placeholder="Password"></input>
                            <div className={styles.checkcontainer}>
                                <input className={styles.check} type="checkbox"></input>
                                <p className={styles.remember}>Remember Me</p>
                                <div className={styles.clear}></div>
                            </div>
                        </div>

                    </div>
                
                    <div className={styles.logincontainer}>
                        <p onClick={open} className={styles.create}>Create an Account</p>
                        <button className={styles.loginbtn}>Log In</button>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default login
