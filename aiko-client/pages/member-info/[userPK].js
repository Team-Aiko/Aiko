import React from 'react';
import axios from 'axios';
import { get, post } from '../../_axios';
import styles from '../../styles/MemberInfo.module.css';
import { makeStyles } from '@material-ui/core/styles';
import { useState, useEffect } from 'react';
import {Paper, Tabs, Tab, Avatar} from '@material-ui/core';
import ActionItems from '../../components/ActionItems.js';
import { useRouter } from 'next/router';
import MyMeetingSchedule from '../../components/MyMeetingSchedule';

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    large: {
        width: theme.spacing(25),
        height: theme.spacing(25),
    },
}));

const MemberInfo = () => {
    const router = useRouter();
    const { userPK } = router.query;

    const classes = useStyles();

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const [value, setValue] = useState(0);

    return (
        <>
            <div className={styles.outerContainer}>
                <div className={styles.upperContainer}>
                    <div className={classes.root}>
                        <Avatar src='../static/testImages/kotone.PNG' className={classes.large} />
                    </div>

                    <div className={styles.profileInfo}>

                    </div>
                </div>

                <div className={styles.tabContainer}>
                    <Paper className={classes.root}>
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            indicatorColor='primary'
                            textColor='primary'
                            centered
                        >
                            <Tab label='Action Items' />

                            <Tab label='Meeting Schedules' />

                            <Tab label='null' />
                        </Tabs>
                    </Paper>

                    {value == 0 ? <ActionItems /> : <></>}
                    {value == 1 ? <MyMeetingSchedule userPK={userPK} /> : <></>}
                    {value == 2 ? <div>PAGE NUMBER 3</div> : <></>}
                </div>
            </div>
        </>
    );
};

export default MemberInfo;
