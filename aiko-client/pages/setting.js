import React, { useState, useEffect } from 'react';
import styles from '../styles/setting.module.css';
import { Typography, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Button } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { get, post } from '../_axios';

const setting = () => {
    const userInfo = useSelector((state) => state.accountReducer);

    const [isAdmin, setIsAdmin] = useState(false);

    const [memberList, setMemberList] = useState([]);

    useEffect(() => {
        if (userInfo.grants[0].AUTH_LIST_PK) {
            setIsAdmin(true);
        }
    });

    const authorizeAdmin = () => {
        const url = '/api/company/permission';
        const data = {
            authListPK: 1,
            targetUserPK: 1,
        };
    };

    useEffect(() => {
        const getMemberList = () => {
            const url = '/api/company/member-list';
            get(url)
                .then((res) => {
                    console.log(res);
                    setMemberList(res);
                })
                .catch((error) => {
                    console.log(error);
                });
        };
        getMemberList();
    }, []);

    const Members = () => {
        return memberList.map((member) => (
            <TableBody>
                <TableRow>
                    <TableCell>{member.LAST_NAME + member.FIRST_NAME}</TableCell>
                    <TableCell className={styles.email}>{member.EMAIL}</TableCell>
                    <TableCell>{member.TEL}</TableCell>
                    <TableCell align='center'>
                        <Tooltip title='관리자 추가'>
                            <Button variant='outlined'>추가</Button>
                        </Tooltip>
                    </TableCell>
                </TableRow>
            </TableBody>
        ));
    };

    return (
        <>
            {isAdmin ? (
                <div className={styles.container}>
                    <Typography variant='h5' className={styles.pageName}>
                        권한 부여 페이지
                    </Typography>
                    <Table style={{ marginBottom: 20 }}>
                        <TableHead style={{ background: '#f1f3f5' }}>
                            <TableRow>
                                <TableCell>이름</TableCell>
                                <TableCell className={styles.email}>이메일</TableCell>
                                <TableCell>전화번호</TableCell>
                                <TableCell align='center'>어드민 추가</TableCell>
                            </TableRow>
                        </TableHead>
                        <Members />
                    </Table>
                </div>
            ) : (
                <Typography>권한이 없으면 볼 수 없는 페이지입니다.</Typography>
            )}
        </>
    );
};

export default setting;
