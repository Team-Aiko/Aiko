import React, { useState, useEffect } from 'react';
import styles from '../styles/components/OrganizeMemberList.module.css';
import { Button, Table, TableCell, TableHead, TableRow, Typography, TableBody } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import SearchMemberModal from './SearchMemberModal';
import { get, post } from 'axios';
import Router from 'next/router';

const useStyles = makeStyles({
    membersTable: {
        overflow: 'auto',
    },
});

export default function OrganizeMemberList(props) {
    const { department, admin } = props;
    const classes = useStyles();
    const [memberModal, setMemberModal] = useState(false);
    const [memberList, setMemberList] = useState([]);

    useEffect(() => {
        if (department.DEPARTMENT_PK) {
            loadMemberList();
        }
    }, [department]);

    const loadMemberList = () => {
        const url = `/api/company/employee-list?deptId=${department.DEPARTMENT_PK}`;
        get(url).then((response) => {
            setMemberList(response.data.result);
        });
    };

    const columns = [
        { id: 'DEPARTMENT_NAME', label: 'Department', minWidth: 110 },
        { id: 'NICKNAME', label: 'Nickname', minWidth: 110 },
        { id: 'FIRST_NAME', label: 'First name', minWidth: 110 },
        { id: 'LAST_NAME', label: 'Last name', minWidth: 110 },
        { id: 'TEL', label: 'Phone number', minWidth: 140 },
        { id: 'EMAIL', label: 'Email', minWidth: 220 },
    ];

    const openAddMemberModal = () => {
        setMemberModal(true);
    };

    const updateDepartment = (user) => {
        const url = '/api/company/add-mem-to-dept';
        const data = {
            departmentPK: department.DEPARTMENT_PK,
            userPK: user.USER_PK,
        };
        post(url, data).then((response) => {
            setMemberModal(false);
            loadMemberList();
        });
    };

    return (
        <div
            className={styles['member-list-container']}
            style={{ visibility: department.DEPARTMENT_NAME ? 'visible' : 'hidden' }}
        >
            <div className={styles['header']}>
                <Typography variant='h6'>{department.DEPARTMENT_NAME}</Typography>
                {admin ? (
                    <Button variant='contained' color='primary' onClick={openAddMemberModal}>
                        ????????????
                    </Button>
                ) : null}
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
                    <TableBody>
                        {memberList.map((row) => (
                            <TableRow
                                key={row.USER_PK}
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    Router.push(`/member-info/${row.USER_PK}`);
                                }}
                            >
                                <TableCell align='center'>{row.department.DEPARTMENT_NAME}</TableCell>
                                <TableCell align='center'>{row.NICKNAME}</TableCell>
                                <TableCell align='center'>{row.FIRST_NAME}</TableCell>
                                <TableCell align='center'>{row.LAST_NAME}</TableCell>
                                <TableCell align='center'>{row.TEL}</TableCell>
                                <TableCell align='center'>{row.EMAIL}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <SearchMemberModal
                open={memberModal}
                onClose={() => {
                    setMemberModal(false);
                }}
                title='?????? ??????'
                selectedUser={(user) => {
                    updateDepartment(user);
                }}
            />
        </div>
    );
}
