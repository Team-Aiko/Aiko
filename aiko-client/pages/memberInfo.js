import React from 'react';
import styles from '../styles/MemberInfo.module.css';

const MemberInfo = () => {
    return (
        <>
        <div className={styles.outerContainer}>

            <div className={styles.upperContainer}>
                <div className={styles.profilePic}>
                    <div className={styles.status}></div>
                </div>
                <div className={styles.profileInfo}>
                    <p>Name</p>
                    <p>Department</p>
                    <p>Hello</p>
                </div>
            </div>

            <div className={styles.lowerContainer}>
                <div className={styles.btnDiv}>
                    <div className={styles.buttons}>
                        <button className={styles.blueBtn}>Online</button>
                        <button className={styles.redBtn}>Offline</button>
                        <button className={styles.greenBtn}>Busy</button>
                    </div>
                </div>
                <div className={styles.logDiv}>LOGS</div>

                <div className={styles.optionDiv}>
                    <button className={styles.inviteBtn}>Invite</button>
                    <button className={styles.messageBtn}>Message</button>
                    <button className={styles.assignBtn}>Assign</button>
                </div>
            </div>

        </div>
        </>
    )
};

export default MemberInfo;