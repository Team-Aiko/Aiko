import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import ChatComp from '../components/commons/chat/ChatComp';
import TopNav from '../components/commons/TopNav';
import styles from '../styles/Home.module.css';
import { Button } from '@material-ui/core';
import ChatModal from '../components/ChatModal';
// * socket Test
import io from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { get } from '../_axios';

export default function CComp() {
    const userInfo = useSelector((state) => state.accountReducer);
    const dispatch = useDispatch();

    return <PComp userInfo={userInfo} />;
}

function PComp(props) {
    const { userInfo } = props;
    const [status, setStatus] = useState(undefined);

    useEffect(() => {
        /**
         * 이하는 status 테스트
         */
        if (userInfo?.USER_PK) {
            const status = io('http://localhost:5000/status');
            setStatus(status);
            const uri = 'api/account/decoding-token';
            get(uri)
                .then((data) => {
                    console.log('🚀 ~ file: index.js ~ line 89 ~ .then ~ result', data);
                    status.emit('handleConnection', data);
                })
                .catch((err) => {
                    console.error(err);
                });
            status.on('client/status/loginAlert', (user) => {
                console.log(user);
            });
            status.on('client/status/logoutAlert', (user) => {
                console.log(user);
            });
            status.on('client/status/error', (err) => {
                console.error(err);
            });
        }
    }, []);

    const testStatusChanger = (num) => {
        console.log(num);
        // status.emit('server/status/changeStatus', { userPK: userInfo.USER_PK, userStatus: num });
    };

    return (
        <>
            <div>
                <button
                    onClick={() => {
                        testStatusChanger(1);
                    }}
                >
                    status1
                </button>
                <button
                    onClick={() => {
                        testStatusChanger(2);
                    }}
                >
                    status2
                </button>
                <button
                    onClick={() => {
                        testStatusChanger(3);
                    }}
                >
                    status3
                </button>
                <button
                    onClick={() => {
                        testStatusChanger(4);
                    }}
                >
                    status4
                </button>
            </div>
        </>
    );
}
