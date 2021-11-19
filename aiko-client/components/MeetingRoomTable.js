import React, { useState, useEffect } from 'react';
import axiosInstance from '../_axios';
import styles from '../styles/components/MeetingRoomTable.module.css';
import moment from 'moment';
import { Button, Grid, IconButton, makeStyles, TextField, Typography } from '@material-ui/core';
import Modal from '../components/Modal';
import SearchMemberModal from './SearchMemberModal';
import CloseIcon from '@material-ui/icons/Close';
import TableView from '../components/TableView';

const useStyles = makeStyles({
    TextField: {
        height: '300px',
    },
    input: {
        height: '100%',
    },
});

export default function MeetingRoomTable(props) {
    const { meetingRoom } = props;
    const classes = useStyles();
    const [openAddScheduleModal, setOpenAddScheduleModal] = useState(false);
    const [inputTitle, setInputTitle] = useState('');
    const [inputMember, setInputMember] = useState([]);
    const [inputNumber, setInputNumber] = useState(0);
    const [inputDescription, setInputDescription] = useState('');
    const [inputDate, setInputDate] = useState(moment().format('YYYY-MM-DD' + 'T' + 'hh:mm'));
    const [openSearchMemberModal, setOpenSearchMemberModal] = useState(false);

    useEffect(() => {
        if (meetingRoom.ROOM_PK) {
            loadSchedule();
        }
    }, [meetingRoom]);

    const loadSchedule = () => {
        const url = '/api/meeting/meet-schedule';
        const params = {
            roomId: meetingRoom.ROOM_PK,
            currentPage: 1,
        };

        axiosInstance.get(url, { params: params }).then((result) => {
            console.log(result);
        });
    };

    const removeMember = (index) => {
        const memberList = [...inputMember];
        memberList.splice(index, 1);
        setInputMember(memberList);
    };

    const addSchedule = () => {
        const url = '/api/meeting/make-meeting';

        const newMemberList =
            inputMember.length > 0
                ? inputMember.map((item) => {
                      return item.USER_PK;
                  })
                : [];

        const newDate = Number(moment(inputDate).format('X'));

        const data = {
            calledMemberList: newMemberList,
            MAX_MEM_NUM: Number(inputNumber),
            ROOM_PK: meetingRoom.ROOM_PK,
            TITLE: inputTitle,
            DATE: newDate,
            DESCRIPTION: inputDescription,
        };

        axiosInstance.post(url, data).then((result) => {
            setOpenAddScheduleModal(false);
            resetInput();
        });
    };
    const resetInput = () => {
        setInputTitle('');
        setInputMember([]);
        setInputNumber(0);
        setInputDescription('');
        setInputDate(moment().format('YYYY-MM-DD' + 'T' + 'hh:mm'));
    };

    const columns = [
        {
            value: 'ROOM_NAME',
            view: '회의실',
        },
        {
            value: 'TITLE',
            view: '회의 주제',
        },
        {
            value: 'MAX_MEM_NUM',
            view: '최대 인원',
        },
        {
            value: 'DATE',
            view: '일시',
        },
    ];

    return (
        <div
            className={styles['meeting-room-table']}
            style={{ visibility: meetingRoom.ROOM_NAME ? 'visible' : 'hidden' }}
        >
            <div className={styles['header']}>
                <Typography variant='h6'>{meetingRoom.ROOM_NAME}</Typography>
                <Button
                    variant='contained'
                    color='primary'
                    onClick={() => {
                        setOpenAddScheduleModal(true);
                    }}
                >
                    일정 추가
                </Button>
            </div>
            <Modal open={openAddScheduleModal} onClose={() => setOpenAddScheduleModal(false)} title='일정 추가'>
                <Grid container spacing={2} style={{ padding: '20px', maxWidth: '600px' }}>
                    <Grid item xs={2}>
                        <Typography>회의 주제</Typography>
                    </Grid>
                    <Grid item xs={10}>
                        <TextField
                            variant='outlined'
                            fullWidth
                            size='small'
                            value={inputTitle}
                            onChange={(e) => {
                                setInputTitle(e.target.value);
                            }}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Typography>일시</Typography>
                    </Grid>
                    <Grid item xs={10}>
                        <TextField
                            variant='outlined'
                            fullWidth
                            size='small'
                            type='datetime-local'
                            value={inputDate}
                            onChange={(e) => {
                                setInputDate(e.target.value);
                            }}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Typography>참석자</Typography>
                    </Grid>
                    <Grid item xs={10} style={{ display: 'flex', alignItems: 'center' }}>
                        {inputMember.length > 0 ? (
                            <div className={styles['selected-user-list']}>
                                {inputMember.map((item, index) => {
                                    return (
                                        <div className={styles['user-wrapper']} key={item.USER_PK}>
                                            <Typography variant='body2'>{item.NICKNAME}</Typography>
                                            <IconButton
                                                style={{ width: '20px', height: '20px', marginLeft: '8px' }}
                                                onClick={() => removeMember(index)}
                                            >
                                                <CloseIcon />
                                            </IconButton>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : null}
                        <Button
                            variant='contained'
                            color='primary'
                            onClick={() => {
                                setOpenSearchMemberModal(true);
                            }}
                        >
                            추가
                        </Button>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography>최대 인원</Typography>
                    </Grid>
                    <Grid item xs={10}>
                        <TextField
                            variant='outlined'
                            fullWidth
                            size='small'
                            value={inputNumber}
                            onChange={(e) => {
                                setInputNumber(e.target.value);
                            }}
                            type='number'
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Typography>설명</Typography>
                    </Grid>
                    <Grid item xs={10}>
                        <TextField
                            multiline
                            variant='outlined'
                            style={{ height: '300px' }}
                            inputProps={{
                                style: {
                                    flex: 1,
                                    height: '100%',
                                },
                            }}
                            fullWidth
                            InputProps={{ className: classes.input }}
                            classes={{ root: classes.textField }}
                            value={inputDescription}
                            onChange={(e) => {
                                setInputDescription(e.target.value);
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
                        <Button variant='contained' color='primary' onClick={addSchedule}>
                            완료
                        </Button>
                    </Grid>
                </Grid>
            </Modal>
            <SearchMemberModal
                open={openSearchMemberModal}
                onClose={() => {
                    setOpenSearchMemberModal(false);
                }}
                onClickSelectedUserList={(user) => {
                    setInputMember((inputMember) => [...inputMember, ...user]);
                    setOpenSearchMemberModal(false);
                }}
                title='참석자 선택'
                multipleSelection={true}
            />
        </div>
    );
}
