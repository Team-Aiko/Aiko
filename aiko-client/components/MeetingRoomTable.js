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
    const { meetingRoom } = props;
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
            view: '?????? ??????',
            width: 1000,
        },
        {
            value: 'MAX_MEM_NUM',
            view: '?????? ??????',
            width: 200,
            style: { flexShrink: 1 },
        },
        {
            value: 'DATE',
            view: '??????',
            width: 500,
        },
        {
            value: 'IS_FINISHED',
            view: '?????? ??????',
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
            finishFlag: true,
        };

        post(url, data).then(() => {
            setOpenScheduleModal(false);
            setTimeout(() => {
                setModalStatus('');
            }, 200);
            callback();

            const updateScheduleList = scheduleList.map((row) => {
                return row.MEET_PK === selectedSchedule.MEET_PK
                    ? {
                          ...row,
                          IS_FINISHED: 1,
                      }
                    : { ...row };
            });
            setScheduleList(updateScheduleList);
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
                    ?????? ??????
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
                                    {row.IS_FINISHED ? '??????' : '??????'}
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
                deleteSchedule={deleteSchedule}
                handleUpdate={handleUpdate}
                handleFinish={handleFinish}
                uploadSchedule={uploadSchedule}
                editButton={true}
            />
        </div>
    );
}
