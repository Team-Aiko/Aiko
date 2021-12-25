import React, { useState, useEffect } from 'react';
import { get } from '../_axios';
import io from 'socket.io-client';

export default function PrivateChatDemo() {
    const [msg, setMsg] = useState('');
    const [PKs, setPKs] = useState({
        userPK: -1,
        companyPK: -1,
    });
    const [roomList, setRoomList] = useState([]);
    const [targetRoomId, setTargetRoomId] = useState('');
    const [socketClient, setSocketClient] = useState(undefined);
    const [logList, setLogList] = useState([]);

    const handleString = (e) => {
        const { value } = e.target;
        setMsg(value);
    };

    const handleSelectChange = (e) => {
        const { value } = e.target;
        setTargetRoomId(value);
        socketClient.emit('server/private-chat/call-chatLog', value);
    };

    const handleSendMessage = () => {
        if (!targetRoomId || !PKs || !msg || !socketClient) return;

        socketClient.emit('server/private-chat/send', {
            roomId: targetRoomId,
            sender: PKs.userPK,
            message: msg,
            date: Math.floor(new Date().getTime() / 1000),
        });

        if (msg.length > 0) {
            setMsg('');
            document.getElementById('msg').value = '';
        }
    };

    // msg receiver
    socketClient?.on('client/private-chat/send', (payload) => {
        console.log('🚀 ~ file: private-chat-test.js ~ line 28 ~ client.on ~ payload', payload);
        const newList = [...logList];
        console.log('🚀 ~ file: private-chat-test.js ~ line 81 ~ client.on ~ newList', newList);
        newList.push(payload.message);
        setLogList(newList);
    });

    useEffect(() => {
        get('api/account/decoding-token').then((data) => {
            console.log('🚀 ~ file: private-chat-test.js ~ line 40 ~ get ~ data', data);

            const { USER_PK, COMPANY_PK } = data;
            setPKs({
                userPK: USER_PK,
                companyPK: COMPANY_PK,
            });

            const client = io('http://localhost:5001/private-chat');
            setSocketClient(client);

            console.log('step1');
            // connection test
            client.emit('handleConnection', {
                userPK: USER_PK,
                companyPK: COMPANY_PK,
            });

            // receive room-list
            client.on('client/private-chat/connected', (roomList) => {
                console.log('🚀 ~ file: private-chat-test.js ~ line 21 ~ client.on ~ roomList', roomList);
                setRoomList(roomList);
            });

            client.on('client/private-chat/receive-chatlog', (chatlog) => {
                console.log('🚀 ~ file: private-chat-test.js ~ line 30 ~ client.on ~ chatlog', chatlog);
                const logs = chatlog.messages;

                const logbundles = logs.map((log) => <p>{log.message}</p>);
                setLogList(logbundles);
            });
        });
    }, []);

    return (
        <>
            <div>{logList?.map((log) => log)}</div>
            <input id='msg' type='text' onChange={handleString} />
            <button onClick={handleSendMessage}>send</button>
            <select onChange={handleSelectChange}>
                {roomList.map((room, idx) => (
                    <option key={idx} value={room.CR_PK}>
                        {room.user2.NICKNAME}
                    </option>
                ))}
            </select>
        </>
    );
}
