import React, { useEffect, useState } from 'react';
import {
    makeStyles,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    ThemeProvider,
    unstable_createMuiStrictModeTheme,
} from '@material-ui/core';
import { get, post } from '../_axios';
import moment from 'moment';
import MeetingScheduleModal from './MeetingScheduleModal';

const useStyles = makeStyles((theme) => ({
    paperRoot: {
        padding: '20px',
    },
}));

export default function MyMeetingSchedule(props) {
    const { userPK } = props;
    const theme = unstable_createMuiStrictModeTheme();
    const classes = useStyles();
    const [scheduleList, setScheduleList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openScheduleModal, setOpenScheduleModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState({});

    useEffect(() => {
        if (userPK) {
            loadSchedule();
        }
    }, [userPK, currentPage, rowsPerPage]);

    const loadSchedule = () => {
        setScheduleList([]);

        const url = '/api/meeting/check-meet-schedule';
        const params = {
            userId: Number(userPK),
            currentPage: currentPage,
            feedPerPage: rowsPerPage,
        };

        get(url, { params: params }).then((result) => {
            setPagination(result.pag);
            setScheduleList(result.schedules);
        });
    };

    const columns = [
        {
            value: 'ROOM_NAME',
            view: '회의실',
            width: 200,
        },
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

    return (
        <Paper className={classes.paperRoot}>
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
                                    setSelectedSchedule(row);
                                    setOpenScheduleModal(true);
                                }}
                            >
                                <TableCell width={200} align='center'>
                                    {row.room.ROOM_NAME}
                                </TableCell>
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
                }}
                schedule={selectedSchedule}
                status='view'
                admin={false}
            />
        </Paper>
    );
}
