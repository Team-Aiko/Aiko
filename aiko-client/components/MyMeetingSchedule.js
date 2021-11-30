import React, { useEffect, useState } from 'react';
import { makeStyles, Paper } from '@material-ui/core';
import { get, post } from '../_axios';

const useStyles = makeStyles((theme) => ({
    paperRoot: {
        padding: '20px',
    },
}));

export default function MyMeetingSchedule(props) {
    const { userPK } = props;
    const classes = useStyles();
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        if (userPK) {
            loadSchedule();
        }
    }, [userPK]);

    const loadSchedule = () => {
        const url = '/api/meeting/check-meet-schedule';
        const params = {
            userId: userPK,
            currentPage: currentPage,
            feedPerPage: rowsPerPage,
        };

        get(url, { params: params }).then((result) => {
            console.log('result : ', result);
        });
    };

    return <Paper className={classes.paperRoot}>schedule</Paper>;
}
