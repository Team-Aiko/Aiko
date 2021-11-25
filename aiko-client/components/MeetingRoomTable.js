import React, { useState, useEffect } from 'react';
import axiosInstance from '../_axios';
import styles from '../styles/components/MeetingRoomTable.module.css';
import moment from 'moment';
import {
    Button,
    Grid,
    IconButton,
    makeStyles,
    TextField,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TablePagination,
    ThemeProvider,
    unstable_createMuiStrictModeTheme,
} from '@material-ui/core';
import Modal from '../components/Modal';
import SearchMemberModal from './SearchMemberModal';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles({
    TextField: {
        height: '300px',
    },
    input: {
        height: '100%',
    },
});

export default function MeetingRoomTable(props) {
    const { meetingRoom, admin } = props;
    const classes = useStyles();
    const theme = unstable_createMuiStrictModeTheme();
    const [openScheduleModal, setOpenScheduleModal] = useState(false);
    const [inputTitle, setInputTitle] = useState('');
    const [inputMember, setInputMember] = useState([]);
    const [inputNumber, setInputNumber] = useState(0);
    const [inputDescription, setInputDescription] = useState('');
    const [inputDate, setInputDate] = useState(moment().format('YYYY-MM-DD' + 'T' + 'hh:mm'));
    const [openSearchMemberModal, setOpenSearchMemberModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState([]);
    const [scheduleList, setScheduleList] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [modalStatus, setModalStatus] = useState('');
    const [selectedSchedule, setSelectedSchedule] = useState({});

    useEffect(() => {
        if (meetingRoom.ROOM_PK) {
            loadSchedule();
        }
    }, [meetingRoom, currentPage, rowsPerPage]);

    const loadSchedule = () => {
        setScheduleList([]);

        const url = '/api/meeting/meet-schedule';
        const params = {
            roomId: meetingRoom.ROOM_PK,
            currentPage: currentPage,
            feedsPerPage: rowsPerPage,
        };

        axiosInstance.get(url, { params: params }).then((result) => {
            setPagination(result.pagination);
            setScheduleList(result.schedules);
        });
    };

    const removeMember = (index) => {
        const memberList = [...inputMember];
        memberList.splice(index, 1);
        setInputMember(memberList);
    };

    const uploadSchedule = () => {
        const url = modalStatus === 'update' ? '/api/meeting/update-meeting' : '/api/meeting/make-meeting';

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

        if (modalStatus === 'update') data.MEET_PK = selectedSchedule.MEET_PK;

        axiosInstance.post(url, data).then((result) => {
            setOpenScheduleModal(false);
            setTimeout(() => {
                setModalStatus('');
            }, 200);
            resetInput();
            loadSchedule();
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
            value: 'TITLE',
            view: '회의 주제',
            width: 1000,
        },
        {
            value: 'MAX_MEM_NUM',
            view: '최대 인원',
            width: 200,
            style: { flexShrink: 1 },
        },
        {
            value: 'DATE',
            view: '일시',
            width: 500,
        },
        {
            value: 'IS_FINISHED',
            view: '진행 여부',
            width: 200,
            style: { flexShrink: 1 },
        },
    ];

    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage + 1);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(event.target.value);
        setCurrentPage(1);
    };

    const handleUpdate = () => {
        setInputTitle(selectedSchedule.TITLE);
        setInputMember(selectedSchedule.members);
        setInputNumber(selectedSchedule.MAX_MEM_NUM);
        setInputDescription(selectedSchedule.DESCRIPTION);
        setInputDate(moment.unix(selectedSchedule.DATE).format('YYYY-MM-DD' + 'T' + 'hh:mm'));

        setModalStatus('update');
    };

    const deleteSchedule = () => {
        const url = '/api/meeting/delete-meeting';
        const data = {
            MEET_PK: selectedSchedule.MEET_PK,
        };

        axiosInstance.post(url, data).then(() => {
            setOpenScheduleModal(false);
            setTimeout(() => {
                setModalStatus('');
            }, 200);
            resetInput();
            loadSchedule();
        });
    };

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
                        setOpenScheduleModal(true);
                    }}
                >
                    일정 추가
                </Button>
            </div>
            <ThemeProvider theme={theme}>
                <Table style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <TableHead>
                        <TableRow style={{ display: 'flex' }}>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.value}
                                    width={column.width}
                                    // style={column.style && column.style : null}
                                    align='center'
                                >
                                    {column.view}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {scheduleList.map((row) => (
                            <TableRow
                                key={row.MEET_PK}
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    setModalStatus('view');
                                    setSelectedSchedule(row);
                                    setOpenScheduleModal(true);
                                }}
                            >
                                <TableCell width={1000} align='center'>
                                    {row.TITLE}
                                </TableCell>
                                <TableCell width={200} align='center'>
                                    {row.MAX_MEM_NUM}
                                </TableCell>
                                <TableCell width={500} align='center'>
                                    {moment.unix(row.DATE).format('YYYY-MM-DD LT')}
                                </TableCell>
                                <TableCell width={200} align='center'>
                                    {row.IS_FINISHED ? '완료' : '예정'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    component='div'
                    rowsPerPageOptions={[10, 20, 30]}
                    count={pagination._totalFeedCnt ? pagination._totalFeedCnt : 0}
                    rowsPerPage={rowsPerPage}
                    page={currentPage - 1}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </ThemeProvider>

            <Modal
                open={openScheduleModal}
                onClose={() => {
                    setOpenScheduleModal(false);
                    setTimeout(() => {
                        setModalStatus('');
                    }, 200);
                }}
                title='일정 추가'
            >
                <Grid
                    container
                    spacing={2}
                    style={{ padding: '20px', maxWidth: '600px', overflow: 'auto', width: '100%' }}
                >
                    <Grid item xs={2}>
                        <Typography>회의 주제</Typography>
                    </Grid>
                    <Grid item xs={10}>
                        {modalStatus !== 'view' ? (
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
                            <Typography>{selectedSchedule.TITLE}</Typography>
                        )}
                    </Grid>
                    <Grid item xs={2}>
                        <Typography>일시</Typography>
                    </Grid>
                    <Grid item xs={10}>
                        {modalStatus !== 'view' ? (
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
                            <Typography>{moment.unix(selectedSchedule.DATE).format('YYYY-MM-DD LT')}</Typography>
                        )}
                    </Grid>
                    <Grid item xs={2}>
                        <Typography>참석자</Typography>
                    </Grid>
                    <Grid item xs={10} style={{ display: 'flex', alignItems: 'center' }}>
                        {modalStatus !== 'view' ? (
                            <>
                                {inputMember.length > 0 ? (
                                    <div className={styles['selected-user-list']}>
                                        {inputMember.map((member, index) => {
                                            return (
                                                <div className={styles['user-wrapper']} key={member.user.USER_PK}>
                                                    <Typography variant='body2'>{member.user.NICKNAME}</Typography>
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
                            <Typography>
                                {selectedSchedule.members.length > 0
                                    ? selectedSchedule.members.map((member, index) => {
                                          if (index < selectedSchedule.members.length - 1) {
                                              return `${member.user.NICKNAME}, `;
                                          } else {
                                              return member.user.NICKNAME;
                                          }
                                      })
                                    : ''}
                            </Typography>
                        )}
                    </Grid>
                    <Grid item xs={2}>
                        <Typography>최대 인원</Typography>
                    </Grid>
                    <Grid item xs={10}>
                        {modalStatus !== 'view' ? (
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
                            <Typography>{selectedSchedule.MAX_MEM_NUM}</Typography>
                        )}
                    </Grid>
                    <Grid item xs={2}>
                        <Typography>설명</Typography>
                    </Grid>
                    <Grid item xs={10}>
                        {modalStatus !== 'view' ? (
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
                                {selectedSchedule.DESCRIPTION.split('\n').map((text, key) => {
                                    return <Typography key={key}>{text}</Typography>;
                                })}
                            </div>
                        )}
                    </Grid>
                    {modalStatus !== 'view' ? (
                        <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
                            <Button variant='contained' color='primary' onClick={uploadSchedule}>
                                {modalStatus === 'update' ? '수정 완료' : '작성 완료'}
                            </Button>
                        </Grid>
                    ) : admin ? (
                        <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                            <Button
                                variant='contained'
                                color='inherit'
                                style={{ marginRight: '10px' }}
                                onClick={handleUpdate}
                            >
                                수정
                            </Button>
                            <Button
                                variant='contained'
                                color='inherit'
                                style={{ marginRight: '10px' }}
                                onClick={deleteSchedule}
                            >
                                삭제
                            </Button>
                            <Button variant='contained' color='primary' onClick={() => console.log('진행 완료')}>
                                진행 완료
                            </Button>
                        </Grid>
                    ) : null}
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
