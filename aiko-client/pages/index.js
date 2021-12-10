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
import { setMember } from '../_redux/memberReducer';

export default function CComp() {
    const userInfo = useSelector((state) => state.accountReducer);
    const memberList = useSelector((state) => state.memberReducer);
    console.log('🚀 ~ file: index.js ~ line 16 ~ CComp ~ userInfo', userInfo);
    const dispatch = useDispatch();

    useEffect(() => {
        if (userInfo.USER_PK) {
            loadMemberList();
        }
    }, [userInfo]);

    const loadMemberList = () => {
        const url = '/api/company/member-list';

        get(url).then((result) => {
            const excludeMe = result.filter((row) => row.USER_PK !== userInfo.USER_PK);
            dispatch(setMember(excludeMe));
        });
    };

    return <PComp userInfo={userInfo} />;
}

function PComp(props) {
    const { userInfo } = props;
    const [status, setStatus] = useState(undefined);

    // useEffect(() => {
    //     /**
    //      * 이하는 status 테스트
    //      */
    //     if (userInfo?.USER_PK) {
    //         const status = io('http://localhost:5000/status');
    //         setStatus(status);

    //         const uri = 'api/account/decoding-token';
    //         get(uri)
    //             .then((data) => {
    //                 console.log('🚀 ~ file: index.js ~ line 89 ~ .then ~ result', data);
    //                 status.emit('handleConnection', data);
    //             })
    //             .catch((err) => {
    //                 console.error(err);
    //             });

    //         status.on('client/status/loginAlert', (payload) => {
    //             console.log('🚀 ~ file: index.js ~ line 42 ~ status.on ~ payload', payload);
    //         });
    //         status.on('client/status/logoutAlert', (payload) => {
    //             console.log('🚀 ~ file: index.js ~ line 45 ~ status.on ~ payload', payload);
    //         });
    //         status.on('client/status/error', (err) => {
    //             console.error(err);
    //         });
    //         status.on('client/status/changeStatus', (payload) => {
    //             console.log('🚀 ~ file: index.js ~ line 53 ~ useEffect ~ payload', payload);
    //         });
    //     }
    // }, []);

    const testStatusChanger = (num) => {
        // status?.emit('server/status/changeStatus', { userPK: userInfo.USER_PK, userStatus: num });
    };

    return (
        <>
            {userInfo.USER_PK ? (
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
            ) : null}
        </>
    );
}
