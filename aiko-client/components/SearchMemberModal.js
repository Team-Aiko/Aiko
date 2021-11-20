import React, { useState } from 'react';
import styles from '../styles/components/SearchMemberModal.module.css';
import Modal from './Modal';
import {
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { get, post } from 'axios';

export default function SearchMemberModal(props) {
    const { open, onClose, title, selectedUser, multipleSelection, onClickSelectedUserList } = props;
    const [member, setMember] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUserList, setSelectedUserList] = useState([]);

    const columns = [
        { id: 'NICKNAME', label: 'Nickname', minWidth: 110 },
        { id: 'FIRST_NAME', label: 'First name', minWidth: 110 },
        { id: 'LAST_NAME', label: 'Last name', minWidth: 110 },
        { id: 'TEL', label: 'Phone number', minWidth: 140 },
        { id: 'EMAIL', label: 'Email', minWidth: 220 },
        { id: 'DEPARTMENT_NAME', label: 'Department', minWidth: 100 },
    ];

    const searchMember = () => {
        const url = `/api/company/searching-members?str=${member}`;

        setSearchResults([]);

        get(url).then((response) => {
            setSearchResults(response.data.result);
        });
    };

    const removeUser = (index) => {
        const userList = [...selectedUserList];
        userList.splice(index, 1);
        setSelectedUserList(userList);
    };

    return (
        <Modal open={open} onClose={onClose} title={title}>
            <div className={styles['search-member-container']}>
                <div className={styles['search-input']}>
                    <TextField
                        variant='outlined'
                        fullWidth
                        size='small'
                        style={{ marginRight: '8px' }}
                        value={member}
                        onChange={(e) => setMember(e.target.value)}
                    />
                    <Button variant='contained' color='primary' onClick={searchMember}>
                        검색
                    </Button>
                </div>
                <div className={styles['table-wrapper']}>
                    <Table
                    // height='100%'
                    // width='100%'
                    // rowHeight={rowHeight}
                    // headerHeight={headerHeight}
                    >
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
                            {searchResults.map((row) => (
                                <TableRow
                                    key={row.USER_PK}
                                    onClick={() => {
                                        if (selectedUser) {
                                            selectedUser(row);
                                            setMember('');
                                            setSearchResults([]);
                                        }
                                        multipleSelection &&
                                            setSelectedUserList((selectedUserList) => [...selectedUserList, row]);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <TableCell align='center'>{row.NICKNAME}</TableCell>
                                    <TableCell align='center'>{row.FIRST_NAME}</TableCell>
                                    <TableCell align='center'>{row.LAST_NAME}</TableCell>
                                    <TableCell align='center'>{row.TEL}</TableCell>
                                    <TableCell align='center'>{row.EMAIL}</TableCell>
                                    <TableCell align='center'>
                                        {row.department ? row.department.DEPARTMENT_NAME : ''}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {multipleSelection ? (
                    <>
                        <div className={styles['selected-user-list']}>
                            {selectedUserList.map((item, index) => {
                                return (
                                    <div className={styles['user-wrapper']} key={item.USER_PK}>
                                        <Typography variant='body2'>{item.NICKNAME}</Typography>
                                        <IconButton
                                            style={{ width: '20px', height: '20px', marginLeft: '8px' }}
                                            onClick={() => removeUser(index)}
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    </div>
                                );
                            })}
                        </div>
                        <Button
                            variant='contained'
                            color='primary'
                            onClick={() => {
                                selectedUserList.length > 0 && onClickSelectedUserList(selectedUserList);
                                setSelectedUserList([]);
                                setSearchResults([]);
                                setMember('');
                            }}
                        >
                            선택 완료
                        </Button>
                    </>
                ) : null}
            </div>
        </Modal>
    );
}
