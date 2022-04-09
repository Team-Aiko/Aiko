import React, { useState } from 'react';
import styles from '../../styles/components/EApprovalWrite.module.css';
import { Typography, Input, TextField, Divider, makeStyles, Button } from '@material-ui/core';

const useStyles = makeStyles({});

const E_Approval_Write = () => {
    const [writer, setWriter] = useState('이치호');
    const classes = useStyles();
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

            <Typography variant='h7' style={{ margin: 20, marginLeft: 30, marginTop: 0 }}>
                결재선
            </Typography>

            <div className={styles['authDiv']}>
                <table className={styles['approval']}>
                    <tbody>
                        <tr className={styles['name']}>
                            <td></td>
                        </tr>
                        <tr className={styles['signature']}>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <Divider style={{ margin: 30 }} />

            <Typography variant='h6' style={{ marginLeft: 30, marginBottom: 20 }}>
                상세 입력
            </Typography>

            <div className={styles['detailDiv']}>
                <div className={styles['title']}>
                    <Typography style={{ flexShrink: 0, margin: 'auto' }}>제목</Typography>
                    <TextField name='title' variant='outlined' size='small' style={{ width: '70%', margin: 'auto' }} />
                </div>
                <TextField multiline variant='outlined' minRows='15' style={{ width: '90%', margin: '20px auto' }} />
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
