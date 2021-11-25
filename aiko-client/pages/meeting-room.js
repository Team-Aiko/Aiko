import React, { useState, useEffect } from 'react';
import axiosInstance from '../_axios/index';
import styles from '../styles/MeetingRoom.module.css';
import MeetingRoomList from '../components/MeetingRoomList';
import MeetingRoomTable from '../components/MeetingRoomTable';

export default function meetingRoom() {
    const [meetingRoom, setMeetingRoom] = useState({});
    const [admin, setAdmin] = useState(false);

    useEffect(() => {
        const url = '/api/company/check-admin';
        axiosInstance.get(url).then((result) => {
            setAdmin(result);
        });
    }, []);

    return (
        <div className={styles['meeting-container']}>
            <MeetingRoomList
                admin={admin}
                meetingRoom={meetingRoom}
                setMeetingRoom={(value) => {
                    setMeetingRoom(value);
                }}
            />
            <MeetingRoomTable admin={admin} meetingRoom={meetingRoom} />
        </div>
    );
}
