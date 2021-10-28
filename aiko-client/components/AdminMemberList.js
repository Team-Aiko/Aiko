import React, { useState } from 'react';
import styles from '../styles/components/AdminMemberList.module.css';
import { Button, Table, TableCell, TableHead, TableRow, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import SearchMemberModal from './SearchMemberModal';

const useStyles = makeStyles({
    membersTable: {
        overflow: 'auto',
    },
});

export default function AdminMemberList(props) {
    const { department } = props;
    const classes = useStyles();
    const [memberModal, setMemberModal] = useState(false);

    const columns = [
        { id: 'nickname', label: 'Nickname', minWidth: 170 },
        { id: 'firstname', label: 'First name', minWidth: 170 },
        { id: 'lastname', label: 'Last name', minWidth: 170 },
        { id: 'phonenumber', label: 'Phone number', minWidth: 170 },
        { id: 'email', label: 'Email', minWidth: 170 },
    ];

    const openAddMemberModal = () => {
        setMemberModal(true);
    };

    return (
        <div
            className={styles['member-list-container']}
            style={{ visibility: department.DEPARTMENT_NAME ? 'visible' : 'hidden' }}
        >
            <div className={styles['header']}>
                <Typography variant='h6'>{department.DEPARTMENT_NAME}</Typography>
                <Button variant='contained' color='primary' onClick={openAddMemberModal}>
                    직원추가
                </Button>
            </div>
            <div className={styles['members-table']}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => {
                                return (
                                    <TableCell key={column.id} align='center' style={{ minWidth: column.minWidth }}>
                                        {column.label}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    </TableHead>
                </Table>
            </div>
            <SearchMemberModal
                open={memberModal}
                onClose={() => {
                    setMemberModal(false);
                }}
                title='직원 추가'
            />
        </div>
    );
}
