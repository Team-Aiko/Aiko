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
    const { admin, meetingRoom, setMeetingRoom } = props;
    const classes = useStyles();
    const [meetingRoomList, setMeetingRoomList] = useState([]);
    const [inputName, setInputName] = useState('');
    const [inputPlace, setInputPlace] = useState('');
    const [openAddMeetingRoomModal, setOpenAddMeetingRoomModal] = useState(false);
    const [update, setUpdate] = useState(false);
    const [modalStatus, setModalStatus] = useState('');

    useEffect(() => {
        loadMeetingRoom();
    }, [admin]);

    const loadMeetingRoom = () => {
        const url = '/api/meeting/meeting-room-list';

        setMeetingRoomList([]);
        axiosInstance.get(url).then((result) => {
            const newResult = result.map((row) => {
                if (meetingRoom && meetingRoom.ROOM_PK === row.ROOM_PK) {
                    setMeetingRoom(row);
                }

                if (admin) {
                    return {
                        ...row,
                        onClick: () => {
                            setMeetingRoom(row);
                        },
                        options: [
                            {
                                view: '수정',
                                key: 'update',
                                onClick: (item) => {
                                    setMeetingRoom(item);
                                    setModalStatus('update');
                                    setInputName(item.ROOM_NAME);
                                    setInputPlace(item.LOCATE);
                                    setOpenAddMeetingRoomModal(true);
                                },
                            },
                            {
                                view: '삭제',
                                key: 'delete',
                                onClick: (item) => {
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
            setModalStatus('');
            loadMeetingRoom();
        });
    };

    const updateMeetingRoom = () => {
        const url = '/api/meeting/update-meeting-room';
        const data = {
            ROOM_PK: meetingRoom.ROOM_PK,
            ROOM_NAME: inputName,
            LOCATE: inputPlace,
        };
        axiosInstance.post(url, data).then((result) => {
            setInputName('');
            setInputPlace('');
            setOpenAddMeetingRoomModal(false);
            setModalStatus('');
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
                            setModalStatus('insert');
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
                    setModalStatus('');
                }}
                title={modalStatus === 'insert' ? '회의실 추가' : '회의실 수정'}
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
                        onClick={modalStatus === 'insert' ? addMeetingRoom : updateMeetingRoom}
                    >
                        {modalStatus === 'insert' ? '추가' : '수정'}
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
