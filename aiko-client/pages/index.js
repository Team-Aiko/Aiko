import React, { useState, useEffect } from 'react';
import LoginView from '../components/LoginView';
import NoLoginView from '../components/NoLoginView';
import styles from '../styles/Main.module.css';
import { useSelector, useDispatch } from 'react-redux';

export default function main() {
    const userInfo = useSelector((state) => state.accountReducer);
    const memberList = useSelector((state) => state.memberReducer);

    useEffect(() => {
        if (userInfo.USER_PK) {
            console.log('🚀 ~ file: index.js ~ line 16 ~ CComp ~ userInfo', userInfo);
        }
    }, [userInfo.USER_PK]);

    return <div className={styles['main-container']}>{userInfo.USER_PK ? <LoginView /> : <NoLoginView />}</div>;
}
