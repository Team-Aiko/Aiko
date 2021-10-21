import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import ChatComp from '../components/commons/chat/ChatComp';
import TopNav from '../components/commons/TopNav';
import styles from '../styles/Home.module.css';
import { Button } from '@material-ui/core';
import ChatModal from '../components/ChatModal';

export default function CComp() {
    return <PComp />;
}

function PComp(props) {
    const [chatModal, setChatModal] = useState(false);

    const openChatModal = () => {
        setChatModal(true);
    };

    return (
        <div>
            <Button onClick={openChatModal}>Test Chat Modal</Button>
            <ChatModal open={chatModal} onClose={() => setChatModal(false)} />
        </div>
    );
}
