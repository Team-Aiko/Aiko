import { TextField, Typography } from '@material-ui/core';
import React from 'react';
import styles from '../styles/components/ReportWriting.module.css';

export default function ReportWriting() {
    return (
        <div className={styles['report-writing']}>
            <div className={styles['top-container']}>
                <div className={styles['top-item']}>
                    <Typography>기본 설정</Typography>
                    <table className={styles['default-settings']}>
                        <tbody>
                            <tr>
                                <td>작성자</td>
                                <td>soso</td>
                            </tr>
                            <tr>
                                <td>문서종류</td>
                                <td>
                                    <select />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className={styles['top-item']}>
                    <Typography>결재선</Typography>
                    <table className={styles.approval}>
                        <tbody>
                            <tr className={styles.name}>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr className={styles.signature}>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className={styles['body-container']}>
                <Typography>상세입력</Typography>
                <div className={styles.title}>
                    <Typography style={{ flexShrink: 0, marginRight: '60px' }}>제목</Typography>
                    <TextField fullWidth variant='outlined' size='small' />
                </div>
                <TextField multiline variant='outlined' style={{ marginTop: '10px', height: '100%' }} maxRows={100} />
            </div>
        </div>
    );
}
