import React from 'react';
import AdminDepartmentTree from '../components/AdminDepartmentTree';
import styles from '../styles/Admin.module.css';

export default function admin() {
    return (
        <div className={styles['admin-container']}>
            <AdminDepartmentTree />
            <div className={styles['member-list-container']}>직원리스트</div>
        </div>
    );
}
