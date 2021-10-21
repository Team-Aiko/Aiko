import React from 'react';
import styles from '../styles/MemberInfo.module.css';

const MemberInfo = () => {
    return (
        <div className={styles.outerContainer}>

            <div className={styles.profileContainer}>
                <div className={styles.profilePic}>
                    <p>img</p>
                </div>

                <div className={styles.profileInfo}>
                    <h5>Name</h5>
                    <h5>Department</h5>
                    <h5>Email, Phone</h5>
                </div>
            </div>

            <div className={styles.optionContainer}>
                <div className={styles.leftDiv}>
                    <div className={styles.stat}>
                        <div className={styles.innerStat}>
                            <button className={styles.blueBtn}></button>
                            <button className={styles.redBtn}></button>
                            <button className={styles.greenBtn}></button>
                        </div>
                    </div>
                    <div className={styles.option}>

                    </div>
                </div>

                <div className={styles.messageDiv}>
                    <button className={styles.inviteBtn}></button>
                    <button className={styles.messageBtn}></button>
                    <button className={styles.assignBtn}></button>
                </div>
            </div>
        </div>
    )
};

export default MemberInfo;