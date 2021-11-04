import React, { useState } from 'react';
import styles from '../styles/ElectronicApproval.module.css';
import ListView from '../components/ListView';
import { Button, makeStyles, Typography } from '@material-ui/core';
import ReportWriting from '../components/ReportWriting';
import Table from '../components/Table';

const useStyles = makeStyles({
    button: {
        height: '46px',
        margin: '20px 20px 10px',
    },
});

export default function electronicApproval() {
    const [currentItem, setCurrentItem] = useState('writing');
    const classes = useStyles();
    const list = [
        {
            value: 'total',
            name: '전체',
            onClick: () => {
                setCurrentItem('total');
            },
            component: <Table />,
        },
        {
            value: 'waiting',
            name: '대기',
            onClick: () => {
                setCurrentItem('waiting');
            },
            component: <Table />,
        },
        {
            value: 'progress',
            name: '진행',
            onClick: () => {
                setCurrentItem('progress');
            },
            component: <Table />,
        },
        {
            value: 'done',
            name: '완료',
            onClick: () => {
                setCurrentItem('done');
            },
            component: <Table />,
        },
    ];
    return (
        <div className={styles['electronic-approval']}>
            <div className={styles.menu}>
                <Button
                    variant='contained'
                    color='primary'
                    className={classes.button}
                    onClick={() => {
                        setCurrentItem('writing');
                    }}
                >
                    기안서 작성
                </Button>
                <ListView value={list} id='value' view='name' onClick='onClick' />
            </div>
            <div className={styles['item-container']}>
                {currentItem === 'writing' ? (
                    <>
                        <Typography variant='h6'>기안서 작성</Typography>
                        <ReportWriting />
                    </>
                ) : (
                    list.map((item) => {
                        if (item.value === currentItem) {
                            return (
                                <div key={item.value}>
                                    <Typography variant='h6'>{item.name}</Typography>
                                    {item.component}
                                </div>
                            );
                        }
                    })
                )}
            </div>
        </div>
    );
}
