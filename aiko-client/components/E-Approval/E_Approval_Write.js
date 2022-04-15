import React, { useState, useCallback } from 'react';
import styles from '../../styles/components/EApprovalWrite.module.css';
import { Typography, Input, TextField, Divider, Button, IconButton, Tooltip } from '@material-ui/core';
import ApprovalTableElement from './E_Approval_Element.js';
import { AddCircle, TrendingFlat } from '@material-ui/icons';
import { post } from '../../_axios';

const E_Approval_Write = () => {
    const [inputs, setInputs] = useState({
        title: '',
        description: '',
    });

    const { title, description } = inputs;

    const onChange = useCallback((e) => {
        const { value, name } = e.target;
        setInputs((prevInput) => ({
            ...prevInput,
            [name]: value,
        }));
    }, []);

    const [writer, setWriter] = useState('이치호');

    //JSX of E_Approval_Element.js
    const [approvalElement, setApprovalElement] = useState([ApprovalTableElement]);

    //Add one more approval column
    const addApprovalSpace = () => {
        setApprovalElement([...approvalElement, ApprovalTableElement]);
    };

    const removeApprovalSpace = (index) => {
        setApprovalElement((items) => items.filter((item, i) => i !== index));
    };

    const [approvalInfoArray, setApprovalInfoArray] = useState([]);

    const getObjectFromChild = (data) => {
        setApprovalInfoArray((approvalInfoArray) => [...approvalInfoArray, data]);
    };

    console.log(approvalInfoArray);

    return (
        <div className={styles['EApprovalWriteDiv']}>
            <div className={styles['titleWriterDiv']}>
                <Typography variant='h6' style={{ margin: 30, marginBottom: 20 }}>
                    기안서 작성
                </Typography>
                <Typography variant='h7' style={{ margin: 30, marginRight: 50 }}>
                    기안자 {writer}
                </Typography>
            </div>

            <div className={styles['addApprovalButtonDiv']}>
                <Typography variant='h7'>결재선</Typography>
                <Tooltip title='결재선을 추가합니다.'>
                    <IconButton onClick={addApprovalSpace}>
                        <AddCircle fontSize='small' />
                    </IconButton>
                </Tooltip>
            </div>

            <div className={styles['authDiv']}>
                {approvalElement.map((element, index) => (
                    <ApprovalTableElement
                        index={index}
                        removeApprovalSpace={removeApprovalSpace}
                        getObjectFromChild={getObjectFromChild}
                    />
                ))}
            </div>

            <div className={styles['approvalDirectionDiv']}>
                <Typography variant='caption' style={{ marginRight: 5 }}>
                    {' '}
                    * 결재 순서{' '}
                </Typography>
                <TrendingFlat fontSize='small' />
            </div>

            <Divider style={{ margin: 30 }} />

            <Typography variant='h6' style={{ marginLeft: 30, marginBottom: 20 }}>
                상세 입력
            </Typography>

            <div className={styles['detailDiv']}>
                <div className={styles['title']}>
                    <Typography style={{ margin: 'auto' }}>제목</Typography>
                    <TextField
                        name='title'
                        value={title}
                        onChange={onChange}
                        variant='outlined'
                        size='small'
                        style={{ width: '65%', margin: 'auto', marginLeft: 0 }}
                    />
                </div>
                <TextField
                    name='description'
                    value={description}
                    onChange={onChange}
                    multiline
                    variant='outlined'
                    minRows='15'
                    style={{ width: '80%', margin: '20px auto' }}
                />
            </div>

            <div className={styles['submitButton']}>
                <Button color='primary' variant='contained' size='large'>
                    제출
                </Button>
            </div>
        </div>
    );
};

export default E_Approval_Write;
