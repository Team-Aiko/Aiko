import React, { useState } from 'react';
import styles from '../../styles/components/EApprovalView.module.css';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@material-ui/core';

const E_Approval_View = ({ currentData }) => {
    return (
        <div className={styles['EApprovalViewDiv']}>
            <Typography variant='h6' style={{ margin: 30 }}>
                {currentData.desc}
            </Typography>

            <Table style={{ width: '95%', margin: 'auto'}}>
                <TableHead>
                    <TableRow>
                        <TableCell align='left'>{currentData.write}</TableCell>
                        <TableCell>{currentData.title}</TableCell>
                        <TableCell align='center'>{currentData.process}</TableCell>
                        <TableCell align='center'>{currentData.date}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell align='left'>이치호</TableCell>
                        <TableCell>2022년 상반기 야유회 결재</TableCell>
                        <TableCell align='center'>진행 중</TableCell>
                        <TableCell align='center'>22.04.01</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
};

export default E_Approval_View;
