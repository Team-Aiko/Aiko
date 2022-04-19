import React, { useState, useEffect } from 'react';
import styles from '../styles/components/LoginView.module.css';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Grid, Table, TableHead, TableRow, TableCell, TableBody, Typography } from '@material-ui/core';
import { get, post } from '../_axios';
import { useRouter } from 'next/router';
import moment from 'moment';

const useStyles = makeStyles((theme) => ({
    paper: {
        height: '100%',
        padding: theme.spacing(2),
        color: theme.palette.text.secondary,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flex: 1,
    },
}));

export default function LoginView() {
    const classes = useStyles();
    const [boardList, setBoardList] = useState([]);
    const router = useRouter();

    useEffect(() => {
        (async () => {
            const loadBoard = await get(`/api/notice-board/list?option=10&pageNum=1`);
            console.log('### loadBoard : ', loadBoard);
            setBoardList(loadBoard);
        })();
    }, []);

    const columns = [
        {
            value: 'TITLE',
            view: '제목',
        },
        {
            value: 'DATE',
            view: '작성일',
        },
    ];

    return (
        <Grid container spacing={3}>
            <Grid item xs={7}>
                <Paper className={classes.paper}>슬라이드 이미지</Paper>
            </Grid>
            <Grid item xs={5}>
                <Paper className={classes.paper}>
                    <div>
                        <Typography style={{ marginBottom: '10px' }}>최근 게시물</Typography>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell key={column.value} align='center'>
                                            {column.view}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {boardList.map((row) => (
                                    <TableRow
                                        key={row.NOTICE_BOARD_PK}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => {
                                            router.push(`/innerPost/${row.NOTICE_BOARD_PK}`);
                                        }}
                                    >
                                        <TableCell>{row.TITLE}</TableCell>
                                        <TableCell align='center'>
                                            {moment.unix(row.CREATE_DATE).format('YYYY-MM-DD')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <Typography
                        align='right'
                        onClick={() => {
                            router.push('/board');
                        }}
                        style={{ cursor: 'pointer', display: 'flex', alignSelf: 'end' }}
                    >
                        + 더보기
                    </Typography>
                </Paper>
            </Grid>
            <Grid item xs={2}>
                <Paper className={classes.paper}>캘린더</Paper>
            </Grid>
            <Grid item xs={5}>
                <Paper className={classes.paper}>진행중인 액션 아이템</Paper>
            </Grid>
            <Grid item xs={5}>
                <Paper className={classes.paper}>진행중인 회의</Paper>
            </Grid>
        </Grid>
    );
}
