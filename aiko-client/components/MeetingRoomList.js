import React, { useState, useEffect } from 'react';
import axiosInstance from '../_axios/index';
import styles from '../styles/components/MeetingRoomList.module.css';
import { Button, makeStyles, TextField, Typography } from '@material-ui/core';
import ListView from './ListView';
import Modal from './Modal';

const useStyles = makeStyles({
    'input-meeting-room': {
        marginRight: '8px',
    },
});

export default function MeetingRoomList(props) {
    const { admin, setMeetingRoom } = props;
    const classes = useStyles();
    const [meetingRoomList, setMeetingRoomList] = useState([]);
    const [inputName, setInputName] = useState('');
    const [inputPlace, setInputPlace] = useState('');
    const [openAddMeetingRoomModal, setOpenAddMeetingRoomModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState({});
    const [update, setUpdate] = useState(false);

    useEffect(() => {
        loadMeetingRoom();
    }, [admin]);

    const loadMeetingRoom = () => {
        const url = '/api/meeting/meeting-room-list';

        setMeetingRoomList([]);
        axiosInstance.get(url).then((result) => {
            const newResult = result.map((row) => {
                if (admin) {
                    return {
                        ...row,
                        onClick: () => {
                            setSelectedItem(row);
                            setMeetingRoom(row);
                        },
                        options: [
                            {
                                view: '수정',
                                key: 'update',
                                onClick: (item) => {
                                    setSelectedItem(item);
                                    setMeetingRoom(item);
                                    setInputName(item.ROOM_NAME);
                                    setInputPlace(item.LOCATE);
                                    setOpenAddMeetingRoomModal(true);
                                },
                            },
                            {
                                view: '삭제',
                                key: 'delete',
                                onClick: (item) => {
                                    setSelectedItem(item);
                                    setMeetingRoom(item);
                                    deleteMeetingRoom(item);
                                },
                            },
                        ],
                    };
                } else {
                    return {
                        ...row,
                        onClick: () => {
                            setSelectedItem(row);
                            setMeetingRoom(row);
                        },
                    };
                }
            });
            setMeetingRoomList(newResult);
        });
    };

    const addMeetingRoom = () => {
        const url = '/api/meeting/creation-meeting-room';
        const data = {
            IS_ONLINE: false,
            ROOM_NAME: inputName,
            LOCATE: inputPlace,
        };

        axiosInstance.post(url, data).then((result) => {
            setInputName('');
            setInputPlace('');
            setOpenAddMeetingRoomModal(false);
            loadMeetingRoom();
        });
    };

    const updateMeetingRoom = () => {
        const url = '/api/meeting/update-meeting-room';
        const data = {
            ROOM_NAME: inputName,
            LOCATE: inputPlace,
        };
        axiosInstance.post(url, data).then((result) => {
            setInputName('');
            setInputPlace('');
            setOpenAddMeetingRoomModal(false);
            setUpdate(!update);
            loadMeetingRoom();
        });
    };

    const deleteMeetingRoom = (item) => {
        const url = '/api/meeting/delete-meeting-room';
        const data = {
            ROOM_PK: item.ROOM_PK,
        };
        axiosInstance.post(url, data).then((result) => {
            setSelectedItem({});
            setMeetingRoom({});
            setUpdate(!update);
            loadMeetingRoom();
        });
    };

    return (
        <div className={styles['meeting-room-list']}>
            <div className={styles['input-meeting-room']}>
                {admin ? (
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={() => {
                            setOpenAddMeetingRoomModal(true);
                        }}
                        fullWidth
                        style={{ marginBottom: '20px' }}
                    >
                        회의실 추가
                    </Button>
                ) : null}
            </div>
            <div className={styles['list-view']}>
                <ListView
                    value={meetingRoomList}
                    id='ROOM_PK'
                    view='ROOM_NAME'
                    reRendering={update}
                    onClick='onClick'
                />
            </div>
            <Modal
                open={openAddMeetingRoomModal}
                onClose={() => {
                    setOpenAddMeetingRoomModal(false);
                    setSelectedItem({});
                    setMeetingRoom({});
                }}
                title='회의실 추가'
            >
                <div className={styles['add-meeting-room-modal']}>
                    <div className={styles['input-wrapper']}>
                        <Typography style={{ flexShrink: 0 }}>이름</Typography>
                        <TextField
                            value={inputName}
                            onChange={(e) => {
                                setInputName(e.target.value);
                            }}
                            variant='outlined'
                            style={{ marginLeft: '8px' }}
                            fullWidth
                        />
                    </div>
                    <div className={styles['input-wrapper']}>
                        <Typography style={{ flexShrink: 0 }}>장소</Typography>
                        <TextField
                            value={inputPlace}
                            onChange={(e) => {
                                setInputPlace(e.target.value);
                            }}
                            variant='outlined'
                            style={{ marginLeft: '8px' }}
                            fullWidth
                        />
                    </div>
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={selectedItem ? updateMeetingRoom : addMeetingRoom}
                    >
                        {selectedItem ? '수정' : '추가'}
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
