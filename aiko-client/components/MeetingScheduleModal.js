import React, { useState } from 'react';
import styles from '../styles/components/MeetingScheduleModal.module.css';
import Modal from '../components/Modal';
import SearchMemberModal from './SearchMemberModal';
import moment from 'moment';
import {
    Avatar,
    Button,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    makeStyles,
    TextField,
    Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import Router from 'next/router';

const useStyles = makeStyles({
    TextField: {
        height: '300px',
    },
    input: {
        height: '100%',
    },
});

export default function MeetingScheduleModal(props) {
    const {
        open,
        onClose,
        roomPK,
        status,
        editButton,
        schedule,
        handleUpdate,
        deleteSchedule,
        handleFinish,
        uploadSchedule,
    } = props;
    const classes = useStyles();
    const [inputTitle, setInputTitle] = useState('');
    const [inputMember, setInputMember] = useState([]);
    const [inputNumber, setInputNumber] = useState(0);
    const [inputDescription, setInputDescription] = useState('');
    const [inputDate, setInputDate] = useState(moment().format('YYYY-MM-DD' + 'T' + 'hh:mm'));
    const [openSearchMemberModal, setOpenSearchMemberModal] = useState(false);

    const removeMember = (index) => {
        const memberList = [...inputMember];
        memberList.splice(index, 1);
        setInputMember(memberList);
    };

    const upload = () => {
        const newMemberList =
            inputMember.length > 0
                ? inputMember.map((item) => {
                      return item.USER_PK;
                  })
                : [];

        const newDate = Number(moment(inputDate).format('X'));

        uploadSchedule(
            {
                calledMemberList: newMemberList,
                MAX_MEM_NUM: Number(inputNumber),
                ROOM_PK: roomPK,
                TITLE: inputTitle,
                DATE: newDate,
                DESCRIPTION: inputDescription,
            },
            resetInput,
        );
    };

    const update = () => {
        setInputTitle(schedule.TITLE);
        setInputMember(schedule.members);
        setInputNumber(schedule.MAX_MEM_NUM);
        setInputDescription(schedule.DESCRIPTION);
        setInputDate(moment.unix(schedule.DATE).format('YYYY-MM-DD' + 'T' + 'hh:mm'));

        handleUpdate();
    };

    const resetInput = () => {
        setInputTitle('');
        setInputMember([]);
        setInputNumber(0);
        setInputDescription('');
        setInputDate(moment().format('YYYY-MM-DD' + 'T' + 'hh:mm'));
    };

    return (
        <Modal open={open} onClose={onClose} title='회의 일정'>
            <Grid container spacing={2} style={{ padding: '20px', maxWidth: '600px', overflow: 'auto', width: '100%' }}>
                <Grid item xs={2}>
                    <Typography>회의 주제</Typography>
                </Grid>
                <Grid item xs={10}>
                    {status !== 'view' ? (
                        <TextField
                            variant='outlined'
                            fullWidth
                            size='small'
                            value={inputTitle}
                            onChange={(e) => {
                                setInputTitle(e.target.value);
                            }}
                        />
                    ) : (
                        <Typography>{schedule && schedule.TITLE}</Typography>
                    )}
                </Grid>
                <Grid item xs={2}>
                    <Typography>일시</Typography>
                </Grid>
                <Grid item xs={10}>
                    {status !== 'view' ? (
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
                    ) : (
                        <Typography>{schedule && moment.unix(schedule.DATE).format('YYYY-MM-DD LT')}</Typography>
                    )}
                </Grid>
                {schedule.room ? (
                    <>
                        <Grid item xs={2}>
                            <Typography>회의실</Typography>
                        </Grid>
                        <Grid item xs={10}>
                            <Typography>{schedule && schedule.room.ROOM_NAME}</Typography>
                        </Grid>
                    </>
                ) : null}
                <Grid item xs={2}>
                    <Typography>참석자</Typography>
                </Grid>
                <Grid item xs={10} style={{ display: 'flex', alignItems: 'center' }}>
                    {status !== 'view' ? (
                        <>
                            {inputMember.length > 0 ? (
                                <div className={styles['selected-user-list']}>
                                    {inputMember.map((member, index) => {
                                        return (
                                            <div
                                                className={styles['user-wrapper']}
                                                key={member.user ? member.user.USER_PK : member.USER_PK}
                                            >
                                                <Typography variant='body2'>
                                                    {member.user ? member.user.NICKNAME : member.NICKNAME}
                                                </Typography>
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
                        </>
                    ) : (
                        // <Typography>
                        //     {schedule.members && schedule.members.length > 0
                        //         ? schedule.members.map((member, index) => {
                        //               if (index < schedule.members.length - 1) {
                        //                   return `${member.user.NICKNAME}, `;
                        //               } else {
                        //                   return member.user.NICKNAME;
                        //               }
                        //           })
                        //         : ''}
                        // </Typography>
                        <div className={styles['member-list']}>
                            {schedule.members && schedule.members.length > 0
                                ? schedule.members.map((member, index) => {
                                      return (
                                          <div
                                              className={styles['list-item']}
                                              key={index}
                                              onClick={() => {
                                                  Router.push(`/member-info/${member.user.USER_PK}`);
                                              }}
                                          >
                                              <Avatar
                                                  style={{ height: '30px', width: '30px', marginRight: '4px' }}
                                                  src={
                                                      member.user.profile &&
                                                      `/api/store/download-profile-file?fileId=${member.user.profile.USER_PROFILE_PK}`
                                                  }
                                              />
                                              <Typography>{member.user.NICKNAME}</Typography>
                                          </div>
                                      );
                                  })
                                : ''}
                        </div>
                    )}
                </Grid>
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
                <Grid item xs={2}>
                    <Typography>최대 인원</Typography>
                </Grid>
                <Grid item xs={10}>
                    {status !== 'view' ? (
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
                    ) : (
                        <Typography>{schedule && schedule.MAX_MEM_NUM}</Typography>
                    )}
                </Grid>
                <Grid item xs={2}>
                    <Typography>설명</Typography>
                </Grid>
                <Grid item xs={10}>
                    {status !== 'view' ? (
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
                    ) : (
                        <div>
                            {schedule.DESCRIPTION &&
                                schedule.DESCRIPTION.split('\n').map((text, key) => {
                                    return <Typography key={key}>{text}</Typography>;
                                })}
                        </div>
                    )}
                </Grid>
                {status !== 'view' ? (
                    <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
                        <Button variant='contained' color='primary' onClick={upload}>
                            {status === 'update' ? '수정 완료' : '작성 완료'}
                        </Button>
                    </Grid>
                ) : editButton ? (
                    <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        {schedule && !schedule.IS_FINISHED ? (
                            <Button
                                variant='contained'
                                color='inherit'
                                style={{ marginRight: '10px' }}
                                onClick={update}
                            >
                                수정
                            </Button>
                        ) : (
                            <></>
                        )}
                        <Button
                            variant='contained'
                            color='inherit'
                            style={{ marginRight: '10px' }}
                            onClick={() => deleteSchedule(resetInput)}
                        >
                            삭제
                        </Button>
                        {schedule && !schedule.IS_FINISHED ? (
                            <Button variant='contained' color='primary' onClick={() => handleFinish(resetInput)}>
                                진행 완료
                            </Button>
                        ) : (
                            <></>
                        )}
                    </Grid>
                ) : null}
            </Grid>
        </Modal>
    );
}
