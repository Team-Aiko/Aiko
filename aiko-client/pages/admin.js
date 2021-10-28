import React, { useState, useEffect } from 'react';
import AdminDepartmentTree from '../components/AdminDepartmentTree';
import AdminMemberList from '../components/AdminMemberList';
import styles from '../styles/Admin.module.css';

export default function admin() {
    const [department, setDepartment] = useState({});

    return (
        <div className={styles['admin-container']}>
            <AdminDepartmentTree
                setDepartment={(value) => {
                    setDepartment(value);
                }}
            />
            <AdminMemberList department={department} />
        </div>
    );
}
