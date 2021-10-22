import React from 'react';
import styles from '../styles/MemberInfo.module.css';

const MemberInfo = () => {
    return (
        <>
        <div className={styles.outerContainer}>

            <div className={styles.upperContainer}>
                <div className={styles.profilePic}></div>
                <div className={styles.profileInfo}>
                    <p>Name</p>
                    <p>Department</p>
                    <p>Hello</p>
                </div>
            </div>

            <div className={styles.lowerContainer}>
                <div className={styles.btnDiv}>
                    <div className={styles.buttons}>
                        <button className={styles.blueBtn}></button>
                        <button className={styles.redBtn}></button>
                        <button className={styles.greenBtn}></button>
                    </div>
                </div>
                <div className={styles.logDiv}></div>
                <div className={styles.optionDiv}></div>
            </div>

        </div>
        </>
    )
};

export default MemberInfo;