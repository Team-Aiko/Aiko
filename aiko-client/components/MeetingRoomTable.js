import React, { useState, useEffect } from 'react';
import { get, post } from '../_axios';
import styles from '../styles/components/MeetingRoomTable.module.css';
import moment from 'moment';
import {
    Button,
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
import MeetingScheduleModal from './MeetingScheduleModal';

export default function MeetingRoomTable(props) {
    const { meetingRoom, admin } = props;
    const theme = unstable_createMuiStrictModeTheme();
    const [openScheduleModal, setOpenScheduleModal] = useState(false);
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

        get(url, { params: params }).then((result) => {
            setPagination(result.pagination);
            setScheduleList(result.schedules);
        });
    };

    const uploadSchedule = (data, callback) => {
        const url = modalStatus === 'update' ? '/api/meeting/update-meeting' : '/api/meeting/make-meeting';

        if (modalStatus === 'update') data.MEET_PK = selectedSchedule.MEET_PK;

        post(url, data).then((result) => {
            setOpenScheduleModal(false);
            setTimeout(() => {
                setModalStatus('');
            }, 200);
            callback();
            loadSchedule();
        });
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
        setModalStatus('update');
    };

    const deleteSchedule = (callback) => {
        const url = '/api/meeting/delete-meeting';
        const data = {
            meetPK: selectedSchedule.MEET_PK,
        };

        post(url, data).then(() => {
            setOpenScheduleModal(false);
            setTimeout(() => {
                setModalStatus('');
            }, 200);
            callback();
            loadSchedule();
        });
    };

    const handleFinish = (callback) => {
        const url = '/api/meeting/finish-meeting';
        const data = {
            meetPK: selectedSchedule.MEET_PK,
            finishFlag: 1,
        };

        post(url, data).then(() => {
            setOpenScheduleModal(false);
            setTimeout(() => {
                setModalStatus('');
            }, 200);
            callback();
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

            <MeetingScheduleModal
                open={openScheduleModal}
                onClose={() => {
                    setOpenScheduleModal(false);
                    setTimeout(() => {
                        setModalStatus('');
                    }, 200);
                }}
                roomPK={meetingRoom.ROOM_PK}
                schedule={selectedSchedule}
                status={modalStatus}
                admin={admin}
                deleteSchedule={deleteSchedule}
                handleUpdate={handleUpdate}
                handleFinish={handleFinish}
                uploadSchedule={uploadSchedule}
            />
        </div>
    );
}
