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

export default function CComp() {
    const userInfo = useSelector((state) => state.accountReducer);
    const dispatch = useDispatch();

    return <PComp userInfo={userInfo} />;
}

function PComp(props) {
    const { userInfo } = props;
    const [chat, setChat] = useState([]);
    const [text, setText] = useState('');
    const [client, setClient] = useState(undefined);

    const [chatModal, setChatModal] = useState(false);
    // 테스트 메세지 발송
    const sendTestMsg = () => {
        client.emit('server/test', text);
        const chatList = [...chat];
        chatList.push(text);
        setChat(chatList);
    };

    const handleChange = (e) => {
        const typedText = e.target.value;
        setText(typedText);
    };

    const openChatModal = () => {
        setChatModal(true);
    };

    useEffect(() => {
        const client = io('http://localhost:5000/chat1');
        setClient(client);

        client.emit('handleConnection', '테스트라 일단 백엔드 비활성화함');

        // room list를 받고 구독을 실시
        client.on('client/OTOChatRoomList', (roomList) => {
            const { USER_PK } = userInfo;
            const list = roomList.map((room) => {
                const { CR_PK } = room;
                return CR_PK;
            });

            client.emit('server/joinRoom', list);
        });

        // 테스트 메세지 수신
        client.on('client/test', (payload) => {
            console.log(payload);
        });
    }, []);

    return (
        <>
            <div>
                <div>{chat.map((item) => `${item} \n`)}</div>
                <input type='text' onChange={handleChange} />
                <button onClick={sendTestMsg}>발송</button>
            </div>
            <div>
                <Button onClick={openChatModal}>Test Chat Modal</Button>
                <ChatModal open={chatModal} onClose={() => setChatModal(false)} />
            </div>
        </>
    );
}
