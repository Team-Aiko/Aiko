import React from 'react';
import AdminTeamTree from '../components/AdminTeamTree';
import styles from '../styles/admin.module.css';

export default function admin() {
    return (
        <div className={styles['admin-container']}>
            <AdminTeamTree />
            <div className={styles['member-list-container']}>직원리스트</div>
        </div>
    );
}
