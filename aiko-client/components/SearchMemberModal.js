import React, { useState } from 'react';
import styles from '../styles/components/SearchMemberModal.module.css';
import Modal from './Modal';
import { Button, Table, TableCell, TableHead, TableRow, TextField } from '@material-ui/core';
import { get, post } from 'axios';

export default function SearchMemberModal(props) {
    const { open, onClose, title } = props;
    const [member, setMember] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const columns = [
        { id: 'NICKNAME', label: 'Nickname', minWidth: 100 },
        { id: 'FIRST_NAME', label: 'First name', minWidth: 100 },
        { id: 'LAST_NAME', label: 'Last name', minWidth: 100 },
        { id: 'TEL', label: 'Phone number', minWidth: 100 },
        { id: 'EMAIL', label: 'Email', minWidth: 100 },
        { id: 'department', label: 'Department', minWidth: 100 },
    ];

    const searchMember = () => {
        const url = `/api/company/searching-members?str=${member}`;
        get(url).then((response) => {
            console.log(response.data.result);
        });
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
                </Table>
            </div>
        </Modal>
    );
}
