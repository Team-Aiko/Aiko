import React, { useState, useEffect } from 'react';
import AdminDepartmentTree from '../components/AdminDepartmentTree';
import AdminMemberList from '../components/AdminMemberList';
import styles from '../styles/Admin.module.css';
import { get, post } from 'axios';
import router from 'next/router';

export default function admin() {
    const [department, setDepartment] = useState({});
    const [admin, setAdmin] = useState(false);

    useEffect(() => {
        const url = 'api/company/check-admin';
        get(url).then((response) => {
            setAdmin(response.data.result);
            if (!response.data.result) {
                setAdmin();
                router.push('/');
            }
        });
    }, []);

    return admin ? (
        <div className={styles['admin-container']}>
            <AdminDepartmentTree
                setDepartment={(value) => {
                    setDepartment(value);
                }}
            />
            <AdminMemberList department={department} />
        </div>
    ) : null;
}
