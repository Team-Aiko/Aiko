import React, { useState } from 'react';
import styles from '../styles/ElectronicApproval.module.css';
import ListView from '../components/ListView';
import { Button, makeStyles, Typography } from '@material-ui/core';
import ReportWriting from '../components/ReportWriting';
import Table from '../components/TableView';

const useStyles = makeStyles({
    button: {
        height: '46px',
        margin: '20px 20px 10px',
    },
});

export default function electronicApproval() {
    const [currentItem, setCurrentItem] = useState('writing');
    const classes = useStyles();

    const totalColumns = [
        {
            value: 'writer',
            view: '작성자',
        },
        {
            value: 'title',
            view: '제목',
        },
        {
            value: 'progress',
            view: '진행',
        },
        {
            value: 'date',
            view: '날짜',
        },
    ];

    const totalData = [
        {
            value: 'writer',
            view: 'soso',
        },
        {
            value: 'title',
            view: '11월 연차',
        },
        {
            value: 'progress',
            view: '완료',
        },
        {
            value: 'date',
            view: '',
        },
    ];

    const waitingColumns = [
        {
            value: 'writer',
            view: '작성자',
        },
        {
            value: 'title',
            view: '제목',
        },
        {
            value: 'waiting',
            view: '결재대기',
        },
        {
            value: 'date',
            view: '날짜',
        },
    ];

    const waitingData = [
        {
            value: 'writer',
            view: 'soso',
        },
        {
            value: 'title',
            view: '11월 연차',
        },
        {
            value: 'waiting',
            view: '대기중',
        },
        {
            value: 'date',
            view: '',
        },
    ];

    const progressColumns = [
        {
            value: 'writer',
            view: '작성자',
        },
        {
            value: 'title',
            view: '제목',
        },
        {
            value: 'waiting',
            view: '현재 결재선',
        },
        {
            value: 'date',
            view: '날짜',
        },
    ];

    const progressData = [
        {
            value: 'writer',
            view: 'soso',
        },
        {
            value: 'title',
            view: '11월 연차',
        },
        {
            value: 'waiting',
            view: 'Avyss 검토 중',
        },
        {
            value: 'date',
            view: '',
        },
    ];

    const list = [
        {
            value: 'total',
            name: '전체',
            onClick: () => {
                setCurrentItem('total');
            },
            component: <Table columns={totalColumns} view='view' value='value' data={totalData} />,
        },
        {
            value: 'waiting',
            name: '대기',
            onClick: () => {
                setCurrentItem('waiting');
            },
            component: <Table columns={waitingColumns} view='view' value='value' data={waitingData} />,
        },
        {
            value: 'progress',
            name: '진행',
            onClick: () => {
                setCurrentItem('progress');
            },
            component: <Table columns={progressColumns} view='view' value='value' data={progressData} />,
        },
        {
            value: 'done',
            name: '완료',
            onClick: () => {
                setCurrentItem('done');
            },
            component: <Table columns={totalColumns} view='view' value='value' data={totalData} />,
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
                        <Typography variant='h6' style={{ marginBottom: '20px' }}>
                            기안서 작성
                        </Typography>
                        <ReportWriting />
                    </>
                ) : (
                    list.map((item) => {
                        if (item.value === currentItem) {
                            return (
                                <div key={item.value}>
                                    <Typography variant='h6' style={{ marginBottom: '20px' }}>
                                        {item.name}
                                    </Typography>
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
